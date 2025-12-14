const LICENSE_PREFIX = "FIRE";
const LICENSE_VALIDITY_MONTHS = 6;

export interface LicenseData {
  key: string;
  activatedAt: string;
  expiresAt: string;
}

export interface LicenseValidationResult {
  isValid: boolean;
  isExpired: boolean;
  daysRemaining: number;
  expirationDate: string | null;
  errorMessage?: string;
}

function calculateChecksum(parts: string[]): boolean {
  if (parts.length !== 4) return false;
  
  const part1 = parts[1];
  const part2 = parts[2];
  const part3 = parts[3];
  
  let sum = 0;
  for (let i = 0; i < part1.length; i++) {
    sum += part1.charCodeAt(i);
  }
  for (let i = 0; i < part2.length; i++) {
    sum += part2.charCodeAt(i);
  }
  
  const checksumChar = String.fromCharCode(65 + (sum % 26));
  return part3.charAt(0) === checksumChar;
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

export function calculateExpirationDate(activatedAt: Date): Date {
  const expirationDate = new Date(activatedAt);
  expirationDate.setMonth(expirationDate.getMonth() + LICENSE_VALIDITY_MONTHS);
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

export function createLicenseData(key: string): LicenseData {
  const activatedAt = new Date();
  const expiresAt = calculateExpirationDate(activatedAt);
  
  return {
    key: key.toUpperCase().trim(),
    activatedAt: activatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
