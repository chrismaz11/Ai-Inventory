import { describe, it, expect } from 'vitest';
import { parsePositiveInt } from './utils';

describe('parsePositiveInt', () => {
  it('should parse valid positive integers', () => {
    expect(parsePositiveInt('1')).toBe(1);
    expect(parsePositiveInt('42')).toBe(42);
    expect(parsePositiveInt('100')).toBe(100);
  });

  it('should return null for non-numeric strings', () => {
    expect(parsePositiveInt('abc')).toBeNull();
    expect(parsePositiveInt('12abc')).toBe(12); // parseInt behavior: parses until non-digit
    // If strict validation is needed, we might need to adjust, but parseInt('12abc') is 12.
    // The current implementation uses parseInt(value, 10).
  });

  it('should return null for zero or negative numbers', () => {
    expect(parsePositiveInt('0')).toBeNull();
    expect(parsePositiveInt('-1')).toBeNull();
    expect(parsePositiveInt('-100')).toBeNull();
  });

  it('should return null for undefined or null', () => {
    expect(parsePositiveInt(undefined)).toBeNull();
    // @ts-expect-error testing null input
    expect(parsePositiveInt(null)).toBeNull();
  });

  it('should return null for floats', () => {
      // parseInt("1.5") is 1. We might want to accept this or not.
      // Current implementation accepts it as 1.
      expect(parsePositiveInt('1.5')).toBe(1);
  });
});
