
/**
 * Parses a string input into a positive integer.
 * Returns null if the input is invalid or less than 1.
 *
 * @param value The string to parse
 * @returns The parsed positive integer or null
 */
export function parsePositiveInt(value: string | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}
