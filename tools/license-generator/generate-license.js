#!/usr/bin/env node

const SECRET_KEY = 'FIRESAFE_ITM_LICENSE_SECRET_2025_NFPA25';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function encodeBase32Custom(num, length) {
  let result = '';
  const base = ALPHABET.length;
  for (let i = 0; i < length; i++) {
    result = ALPHABET[num % base] + result;
    num = Math.floor(num / base);
  }
  return result;
}

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

function generateSalt() {
  const randomNum = Math.floor(Math.random() * (ALPHABET.length * ALPHABET.length));
  return encodeBase32Custom(randomNum, 2);
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

function generateLicenseKey(validityMonths = 6) {
  if (validityMonths < 1 || validityMonths > 99) {
    throw new Error('Validity months must be between 1 and 99');
  }

  const monthsEncoded = encodeBase32Custom(validityMonths, 2);
  const salt = generateSalt();
  const dataToSign = monthsEncoded + salt;
  const signatureFull = calculateSignature(dataToSign);
  let signature = '';
  for (let i = 0; i < 6; i++) {
    const hexPair = signatureFull.substr(i * 2, 2);
    const num = parseInt(hexPair, 16);
    signature += ALPHABET[num % ALPHABET.length];
  }
  const allData = monthsEncoded + salt + signature;
  let checksum = 0;
  for (let i = 0; i < allData.length; i++) {
    const idx = ALPHABET.indexOf(allData[i]);
    if (idx !== -1) {
      checksum = (checksum + idx) % ALPHABET.length;
    }
  }
  const checksumChars = encodeBase32Custom(checksum, 2);
  const keyData = monthsEncoded + salt + signature + checksumChars;
  const part1 = keyData.substring(0, 4);
  const part2 = keyData.substring(4, 8);
  const part3 = keyData.substring(8, 12);

  return `FIRE-${part1}-${part2}-${part3}`;
}

function validateLicenseKey(key) {
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

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'validate' && args[1]) {
    const result = validateLicenseKey(args[1]);
    console.log('\n=== License Key Validation ===');
    console.log(`Key: ${args[1]}`);
    console.log(`Valid: ${result.valid}`);
    if (result.valid) {
      console.log(`Validity: ${result.validityMonths} months`);
    } else {
      console.log(`Error: ${result.error}`);
    }
    console.log('');
    process.exit(result.valid ? 0 : 1);
  }
  
  const months = parseInt(args[0]) || 6;
  const count = parseInt(args[1]) || 1;

  console.log('\n=== FireSafe ITM License Key Generator ===');
  console.log(`Generating ${count} license key(s) with ${months}-month validity\n`);

  for (let i = 0; i < count; i++) {
    const key = generateLicenseKey(months);
    const validation = validateLicenseKey(key);
    console.log(`${i + 1}. ${key}`);
    if (!validation.valid) {
      console.log(`   WARNING: Self-validation failed: ${validation.error}`);
    }
  }

  console.log('\n');
}

module.exports = {
  generateLicenseKey,
  validateLicenseKey,
  SECRET_KEY,
  ALPHABET,
  encodeBase32Custom,
  decodeBase32Custom,
  calculateSignature,
};
