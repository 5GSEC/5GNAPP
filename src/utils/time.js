/**
 * Shared timestamp parsing utility.
 *
 * Accepts epoch timestamps in either seconds (10-digit) or milliseconds
 * (13-digit) form and returns a Date, or null when the value is missing or
 * not numeric.
 *
 * @param {string|number} raw
 * @returns {Date|null}
 */
export function parseTimestamp(raw) {
  if (!raw && raw !== 0) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  // Values below 1e12 are treated as seconds, otherwise milliseconds.
  return n < 1e12 ? new Date(n * 1000) : new Date(n);
}

export default parseTimestamp;
