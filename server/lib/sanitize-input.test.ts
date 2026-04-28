import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  MAX_NOTES_BYTES,
  MAX_GENERIC_BYTES,
} from './sanitize-input.js';

describe('sanitizeText', () => {
  it('returns null for non-string input', () => {
    expect(sanitizeText(null, 100)).toBeNull();
    expect(sanitizeText(undefined, 100)).toBeNull();
    expect(sanitizeText(42, 100)).toBeNull();
    expect(sanitizeText({}, 100)).toBeNull();
  });

  it('strips control chars', () => {
    expect(sanitizeText('hello\x00\x01world', 100)).toBe('helloworld');
  });

  it('preserves newlines and tabs', () => {
    expect(sanitizeText('line one\nline two\ttabbed', 100)).toBe('line one\nline two\ttabbed');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('   padded   ', 100)).toBe('padded');
  });

  it('truncates to maxBytes', () => {
    const long = 'x'.repeat(MAX_NOTES_BYTES + 500);
    expect(sanitizeText(long, MAX_NOTES_BYTES)).toHaveLength(MAX_NOTES_BYTES);
  });

  it('caps oversized notes at MAX_NOTES_BYTES', () => {
    const long = 'a'.repeat(20_000);
    expect(sanitizeText(long, MAX_NOTES_BYTES)).toHaveLength(MAX_NOTES_BYTES);
  });

  it('caps oversized generic fields', () => {
    const long = 'b'.repeat(2000);
    expect(sanitizeText(long, MAX_GENERIC_BYTES)).toHaveLength(MAX_GENERIC_BYTES);
  });
});
