const LICENSE_PREFIX = "FIRE";
const SECRET_KEY = "FIRESAFE_ITM_LICENSE_SECRET_2025_NFPA25";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export interface LicenseData {
  key: string;
  activatedAt: string;
  expiresAt: string;
  validityMonths: number;
}

export interface LicenseValidationResult {
  isValid: boolean;
  isExpired: boolean;
  daysRemaining: number;
  expirationDate: string | null;
  errorMessage?: string;
}

export interface LicenseKeyValidation {
  valid: boolean;
  validityMonths?: number;
  error?: string;
}

function encodeBase32Custom(num: number, length: number): string {
  let result = '';
  const base = ALPHABET.length;
  let n = num;
  for (let i = 0; i < length; i++) {
    result = ALPHABET[n % base] + result;
    n = Math.floor(n / base);
  }
  return result;
}

function decodeBase32Custom(str: string): number {
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

function simpleHash(str: string): string {
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

function calculateSignature(data: string): string {
  const combined = SECRET_KEY + ':' + data + ':' + SECRET_KEY;
  const hash1 = simpleHash(combined);
  const hash2 = simpleHash(hash1 + combined);
  return hash1 + hash2;
}

export function validateLicenseKeyFormat(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  
  const normalizedKey = key.toUpperCase().trim();
  const pattern = /^FIRE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  
  if (!pattern.test(normalizedKey)) return false;
  
  const parts = normalizedKey.split("-");
  if (parts[0] !== LICENSE_PREFIX) return false;
  
  return true;
}

export function validateLicenseKeyCrypto(key: string): LicenseKeyValidation {
  const normalizedKey = key.toUpperCase().trim();
  const pattern = /^FIRE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  
  if (!pattern.test(normalizedKey)) {
    return { valid: false, error: 'invalid_format' };
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
      return { valid: false, error: 'invalid_character' };
    }
    checksum = (checksum + idx) % ALPHABET.length;
  }
  const expectedChecksum = encodeBase32Custom(checksum, 2);
  if (checksumChars !== expectedChecksum) {
    return { valid: false, error: 'checksum_mismatch' };
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
    return { valid: false, error: 'invalid_signature' };
  }
  const validityMonths = decodeBase32Custom(monthsEncoded);
  
  if (validityMonths < 1 || validityMonths > 99) {
    return { valid: false, error: 'invalid_validity' };
  }

  return {
    valid: true,
    validityMonths,
  };
}

export function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  const generatePart = () => {
    let part = "";
    for (let i = 0; i < 4; i++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return part;
  };
  
  const part1 = generatePart();
  const part2 = generatePart();
  
  let sum = 0;
  for (let i = 0; i < part1.length; i++) {
    sum += part1.charCodeAt(i);
  }
  for (let i = 0; i < part2.length; i++) {
    sum += part2.charCodeAt(i);
  }
  
  const checksumChar = String.fromCharCode(65 + (sum % 26));
  const part3 = checksumChar + generatePart().substring(1);
  
  return `${LICENSE_PREFIX}-${part1}-${part2}-${part3}`;
}

export function calculateExpirationDate(activatedAt: Date, validityMonths: number = 6): Date {
  const expirationDate = new Date(activatedAt);
  expirationDate.setMonth(expirationDate.getMonth() + validityMonths);
  return expirationDate;
}

export function checkLicenseExpiration(licenseData: LicenseData): LicenseValidationResult {
  const now = new Date();
  const expirationDate = new Date(licenseData.expiresAt);
  
  const isExpired = now > expirationDate;
  const timeDiff = expirationDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  
  return {
    isValid: !isExpired,
    isExpired,
    daysRemaining,
    expirationDate: licenseData.expiresAt,
  };
}

export function formatDate(dateString: string, language: "pt-BR" | "en"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(language === "pt-BR" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function createLicenseData(key: string, validityMonths: number = 6): LicenseData {
  const activatedAt = new Date();
  const expiresAt = calculateExpirationDate(activatedAt, validityMonths);
  
  return {
    key: key.toUpperCase().trim(),
    activatedAt: activatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    validityMonths,
  };
}
