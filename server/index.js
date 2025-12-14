const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SECRET_KEY = 'FIRESAFE_ITM_LICENSE_SECRET_2025_NFPA25';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function decodeBase32Custom(str) {
  const base = ALPHABET.length;
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toUpperCase();
    const index = ALPHABET.indexOf(char);
    if (index === -1) return -1;
    result = result * base + index;
  }
  return result;
}

function encodeBase32Custom(num, length) {
  let result = '';
  const base = ALPHABET.length;
  for (let i = 0; i < length; i++) {
    result = ALPHABET[num % base] + result;
    num = Math.floor(num / base);
  }
  return result;
}

function simpleHash(str) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

function calculateSignature(data) {
  const combined = SECRET_KEY + ':' + data + ':' + SECRET_KEY;
  const hash1 = simpleHash(combined);
  const hash2 = simpleHash(hash1 + combined);
  return hash1 + hash2;
}

function validateLicenseKeyFormat(key) {
  const normalizedKey = key.toUpperCase().trim();
  const pattern = /^FIRE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  
  if (!pattern.test(normalizedKey)) {
    return { valid: false, error: 'Invalid format' };
  }

  const parts = normalizedKey.split('-');
  const keyData = parts[1] + parts[2] + parts[3];
  const monthsEncoded = keyData.substring(0, 2);
  const salt = keyData.substring(2, 4);
  const signature = keyData.substring(4, 10);
  const checksumChars = keyData.substring(10, 12);

  let checksum = 0;
  const dataWithoutChecksum = keyData.substring(0, 10);
  for (let i = 0; i < dataWithoutChecksum.length; i++) {
    const idx = ALPHABET.indexOf(dataWithoutChecksum[i]);
    if (idx === -1) {
      return { valid: false, error: 'Invalid character in key' };
    }
    checksum = (checksum + idx) % ALPHABET.length;
  }
  const expectedChecksum = encodeBase32Custom(checksum, 2);
  if (checksumChars !== expectedChecksum) {
    return { valid: false, error: 'Checksum mismatch' };
  }

  const dataToSign = monthsEncoded + salt;
  const signatureFull = calculateSignature(dataToSign);
  let expectedSignature = '';
  for (let i = 0; i < 6; i++) {
    const hexPair = signatureFull.substr(i * 2, 2);
    const num = parseInt(hexPair, 16);
    expectedSignature += ALPHABET[num % ALPHABET.length];
  }

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid signature' };
  }

  const validityMonths = decodeBase32Custom(monthsEncoded);
  
  return {
    valid: true,
    validityMonths,
    salt,
  };
}

app.post('/api/license/activate', async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey || !deviceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'License key and device ID are required' 
      });
    }

    const normalizedKey = licenseKey.toUpperCase().trim();
    const validation = validateLicenseKeyFormat(normalizedKey);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error 
      });
    }

    const existingLicense = await pool.query(
      'SELECT * FROM licenses WHERE license_key = $1',
      [normalizedKey]
    );

    if (existingLicense.rows.length > 0) {
      const license = existingLicense.rows[0];
      
      if (license.is_used && license.device_id !== deviceId) {
        return res.status(400).json({ 
          success: false, 
          error: 'License already used on another device' 
        });
      }

      if (license.device_id === deviceId) {
        const activatedAt = new Date(license.activated_at);
        const expiresAt = new Date(activatedAt);
        expiresAt.setMonth(expiresAt.getMonth() + license.validity_months);

        return res.json({
          success: true,
          validityMonths: license.validity_months,
          activatedAt: license.activated_at,
          expiresAt: expiresAt.toISOString(),
        });
      }
    }

    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt);
    expiresAt.setMonth(expiresAt.getMonth() + validation.validityMonths);

    await pool.query(
      `INSERT INTO licenses (license_key, validity_months, device_id, activated_at, is_used)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (license_key) 
       DO UPDATE SET device_id = $3, activated_at = $4, is_used = true`,
      [normalizedKey, validation.validityMonths, deviceId, activatedAt]
    );

    res.json({
      success: true,
      validityMonths: validation.validityMonths,
      activatedAt: activatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('License activation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during activation' 
    });
  }
});

app.post('/api/license/validate', async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey || !deviceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'License key and device ID are required' 
      });
    }

    const normalizedKey = licenseKey.toUpperCase().trim();

    const result = await pool.query(
      'SELECT * FROM licenses WHERE license_key = $1 AND device_id = $2 AND is_used = true',
      [normalizedKey, deviceId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'License not found or not activated for this device' 
      });
    }

    const license = result.rows[0];
    const activatedAt = new Date(license.activated_at);
    const expiresAt = new Date(activatedAt);
    expiresAt.setMonth(expiresAt.getMonth() + license.validity_months);

    const now = new Date();
    if (now > expiresAt) {
      return res.status(400).json({ 
        success: false, 
        error: 'License has expired',
        expired: true,
        expiresAt: expiresAt.toISOString(),
      });
    }

    res.json({
      success: true,
      validityMonths: license.validity_months,
      activatedAt: license.activated_at,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during validation' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`License server running on port ${PORT}`);
});
