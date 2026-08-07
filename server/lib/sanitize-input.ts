export const MAX_NOTES_BYTES = 4 * 1024;
export const MAX_NAME_BYTES = 200;
export const MAX_GENERIC_BYTES = 500;

// Tab (0x09), line feed (0x0A) and carriage return (0x0D) are legitimate in
// free-text fields; every other C0 control character and DEL (0x7F) is not.
const ALLOWED_CONTROL_CODES = new Set([0x09, 0x0a, 0x0d]);

/**
 * Removes C0 control characters and DEL while keeping tabs and newlines.
 *
 * Expressed as a code-point test rather than a character-class regex on
 * purpose: a literal `[\x00-\x08...]` class embeds real control characters in
 * the source, which is what `no-control-regex` exists to catch. Testing the
 * code point states the same intent without putting control bytes in the file.
 */
function stripControlChars(value: string): string {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControl = (code < 0x20 && !ALLOWED_CONTROL_CODES.has(code)) || code === 0x7f;
    if (!isControl) out += char;
  }
  return out;
}

export function sanitizeText(value: unknown, maxBytes: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;
  const cleaned = stripControlChars(value).trim();
  return cleaned.slice(0, maxBytes);
}
