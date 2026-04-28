const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export const MAX_NOTES_BYTES = 4 * 1024;
export const MAX_NAME_BYTES = 200;
export const MAX_GENERIC_BYTES = 500;

export function sanitizeText(value: unknown, maxBytes: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(CONTROL_CHARS, '').trim();
  return cleaned.slice(0, maxBytes);
}
