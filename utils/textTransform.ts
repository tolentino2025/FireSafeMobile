export function toUpperIfNotEmail(value: string, fieldName?: string): string {
  if (!value) return value;

  if (fieldName?.toLowerCase()?.includes("email")) {
    return value;
  }

  return value.toUpperCase();
}
