const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { Client } = require('@replit/object-storage');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const storageClient = new Client();

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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inspectors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inspectors ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inspections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inspections ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inspection_schedules ORDER BY next_due_date');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/photos/upload', async (req, res) => {
  try {
    const { inspection_id, checklist_item_id, base64, caption, mime_type } = req.body;
    
    const photoId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const storageKey = `photos/${inspection_id}/${photoId}.jpg`;
    
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const { ok, error } = await storageClient.uploadFromBytes(storageKey, buffer);
    if (!ok) {
      return res.status(500).json({ error: `Upload failed: ${error}` });
    }
    
    const result = await pool.query(
      `INSERT INTO inspection_photos (inspection_id, checklist_item_id, storage_key, caption, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [inspection_id, checklist_item_id, storageKey, caption, mime_type || 'image/jpeg', buffer.length]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/photos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inspection_photos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photo = result.rows[0];
    const { ok, value, error } = await storageClient.downloadAsBytes(photo.storage_key);
    if (!ok) {
      return res.status(500).json({ error: `Download failed: ${error}` });
    }
    
    res.setHeader('Content-Type', photo.mime_type);
    res.send(Buffer.from(value));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/photos/inspection/:inspection_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM inspection_photos WHERE inspection_id = $1 ORDER BY created_at',
      [req.params.inspection_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sync', async (req, res) => {
  try {
    const { companies, inspectors, properties, inspections, schedules, lastSyncAt } = req.body;
    const results = { companies: 0, inspectors: 0, properties: 0, inspections: 0, schedules: 0 };
    
    if (companies?.length) {
      for (const company of companies) {
        await pool.query(
          `INSERT INTO companies (id, name, cnpj, address, city, state, zip_code, contact_name, contact_phone, contact_email)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name, cnpj = EXCLUDED.cnpj, address = EXCLUDED.address,
             city = EXCLUDED.city, state = EXCLUDED.state, zip_code = EXCLUDED.zip_code,
             contact_name = EXCLUDED.contact_name, contact_phone = EXCLUDED.contact_phone,
             contact_email = EXCLUDED.contact_email, updated_at = NOW()`,
          [company.id, company.name, company.cnpj, company.address, company.city, 
           company.state, company.zipCode, company.contactName, company.contactPhone, company.contactEmail]
        );
        results.companies++;
      }
    }
    
    if (inspectors?.length) {
      for (const inspector of inspectors) {
        await pool.query(
          `INSERT INTO inspectors (id, name, email, phone, role, crea_cau)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone,
             role = EXCLUDED.role, crea_cau = EXCLUDED.crea_cau, updated_at = NOW()`,
          [inspector.id, inspector.name, inspector.email, inspector.phone, inspector.role, inspector.creaCau]
        );
        results.inspectors++;
      }
    }
    
    if (properties?.length) {
      for (const property of properties) {
        await pool.query(
          `INSERT INTO properties (id, name, address, phone, contact, company_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name, address = EXCLUDED.address, phone = EXCLUDED.phone,
             contact = EXCLUDED.contact, company_id = EXCLUDED.company_id, updated_at = NOW()`,
          [property.id, property.name, property.address, property.phone, property.contact, property.companyId]
        );
        results.properties++;
      }
    }
    
    if (inspections?.length) {
      for (const inspection of inspections) {
        await pool.query(
          `INSERT INTO inspections (
            id, type, frequency, date, property_id, property_name, property_address,
            property_phone, inspector_id, inspector_name, company_id, company_data,
            inspector_data, checklist, observations, signature, contract_no,
            geo_location, fire_pump_data, fire_pump_panel_data, fm85a_data, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
           ON CONFLICT (id) DO UPDATE SET
             type = EXCLUDED.type, frequency = EXCLUDED.frequency, date = EXCLUDED.date,
             property_id = EXCLUDED.property_id, property_name = EXCLUDED.property_name,
             property_address = EXCLUDED.property_address, property_phone = EXCLUDED.property_phone,
             inspector_id = EXCLUDED.inspector_id, inspector_name = EXCLUDED.inspector_name,
             company_id = EXCLUDED.company_id, company_data = EXCLUDED.company_data,
             inspector_data = EXCLUDED.inspector_data, checklist = EXCLUDED.checklist,
             observations = EXCLUDED.observations, signature = EXCLUDED.signature,
             contract_no = EXCLUDED.contract_no, geo_location = EXCLUDED.geo_location,
             fire_pump_data = EXCLUDED.fire_pump_data, fire_pump_panel_data = EXCLUDED.fire_pump_panel_data,
             fm85a_data = EXCLUDED.fm85a_data, status = EXCLUDED.status, updated_at = NOW()`,
          [inspection.id, inspection.type, inspection.frequency, inspection.date,
           inspection.propertyId, inspection.propertyName, inspection.propertyAddress,
           inspection.propertyPhone, inspection.inspectorId, inspection.inspectorName,
           inspection.companyId, inspection.companyData, inspection.inspectorData,
           inspection.checklist, inspection.observations, inspection.signature,
           inspection.contractNo, inspection.geoLocation, inspection.firePumpData,
           inspection.firePumpPanelData, inspection.fm85aData, inspection.status || 'draft']
        );
        results.inspections++;
      }
    }
    
    if (schedules?.length) {
      for (const schedule of schedules) {
        await pool.query(
          `INSERT INTO inspection_schedules (
            id, company_id, property_id, fire_pump_id, inspection_type, frequency,
            start_date, last_inspection_date, next_due_date, notification_id, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             company_id = EXCLUDED.company_id, property_id = EXCLUDED.property_id,
             fire_pump_id = EXCLUDED.fire_pump_id, inspection_type = EXCLUDED.inspection_type,
             frequency = EXCLUDED.frequency, start_date = EXCLUDED.start_date,
             last_inspection_date = EXCLUDED.last_inspection_date, next_due_date = EXCLUDED.next_due_date,
             notification_id = EXCLUDED.notification_id, is_active = EXCLUDED.is_active, updated_at = NOW()`,
          [schedule.id, schedule.companyId, schedule.propertyId, schedule.firePumpId,
           schedule.inspectionType, schedule.frequency, schedule.startDate,
           schedule.lastInspectionDate, schedule.nextDueDate, schedule.notificationId, schedule.isActive]
        );
        results.schedules++;
      }
    }
    
    res.json({ 
      success: true, 
      syncedAt: new Date().toISOString(),
      counts: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sync/pull', async (req, res) => {
  try {
    const lastSyncAt = req.query.lastSyncAt || '1970-01-01';
    
    const [companies, inspectors, properties, inspections, schedules] = await Promise.all([
      pool.query('SELECT * FROM companies WHERE updated_at > $1', [lastSyncAt]),
      pool.query('SELECT * FROM inspectors WHERE updated_at > $1', [lastSyncAt]),
      pool.query('SELECT * FROM properties WHERE updated_at > $1', [lastSyncAt]),
      pool.query('SELECT * FROM inspections WHERE updated_at > $1', [lastSyncAt]),
      pool.query('SELECT * FROM inspection_schedules WHERE updated_at > $1', [lastSyncAt]),
    ]);
    
    res.json({
      companies: companies.rows,
      inspectors: inspectors.rows,
      properties: properties.rows,
      inspections: inspections.rows,
      schedules: schedules.rows,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FireSafe ITM API running on port ${PORT}`);
});
