import BigNumber from 'bignumber.js';

/**
 * Configuration for BigNumber.
 */
BigNumber.config({
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: 1e9,
  DECIMAL_PLACES: 18,
});

/**
 * Creates a new BigNumber instance.
 * @param {BigNumber.Value} num - The numeric value to convert to BigNumber.
 * @returns {BigNumber} A BigNumber instance.
 */
export const BN = (num: BigNumber.Value): BigNumber => new BigNumber(num);

/**
 * Converts a BigNumber value to a display string.
 * @param {BigNumber.Value} value - The BigNumber value to convert.
 * @param {Object} options - Conversion options.
 * @param {number} options.decimals - The number of decimals to consider.
 * @param {number} options.round - The number of decimals to round to.
 * @param {boolean} options.cut - Whether to cut off extra decimals.
 * @returns {string} The formatted display string.
 */
export function getDisplayAmount(
  value: BigNumber.Value,
  { decimals = 18, round = 4, cut = true } = {},
): string {
  const normalizedValue = BN(value).div(BN(10).pow(decimals));
  if (normalizedValue.eq(0)) return '0';
  const fixedValue = normalizedValue.toFixed(decimals);

  if (!cut) return fixedValue;

  if (normalizedValue.lt(0.0001)) {
    return extractFirstTwoNonZeroDigits(fixedValue);
  }

  return normalizeNumber(fixedValue, round);
}

/**
 * Converts a string value to its atomic representation in BigNumber.
 * @param {string} value - The string value to convert.
 * @param {number} decimals - The number of decimals to consider.
 * @returns {string} The atomic amount as a string.
 */
export function getAtomicAmount(value: string, decimals = 18): string {
  return BN(value).times(BN(10).pow(decimals)).toFixed(0);
}

/**
 * Safely creates a BigNumber from a string. Returns null if an error occurs.
 * @param {string} n - The string to convert to BigNumber.
 * @returns {BigNumber | null} A BigNumber instance or null if an error occurs.
 */
export const safeBN = (n: string): BigNumber | null => {
  try {
    return BN(n);
  } catch (err) {
    console.error('Error creating BigNumber:', err);
    return null;
  }
};

/**
 * Shortens a BigNumber value for display purposes.
 * @param {BigNumber.Value} x - The BigNumber value to shorten.
 * @param {number} precision - The precision for the shortened number.
 * @returns {string} The shortened number as a string.
 */
export function shortenNumber(x: BigNumber.Value, precision: number = 2): string {
  // Use constants for better readability
  const MILLION = 1e6;
  const THOUSAND = 1e3;

  const bnValue = BN(x);

  if (bnValue.gte(MILLION)) {
    return `${bnValue.div(MILLION).toFixed(precision)}M`;
  }

  if (bnValue.gte(THOUSAND)) {
    return `${bnValue.div(THOUSAND).toFixed(precision)}K`;
  }

  if (bnValue.eq(0)) return '0';
  if (bnValue.lt(0.001)) return '< 0.001';

  return bnValue.toFixed(precision);
}

/**
 * Formats a number with spaces for thousands.
 * @param {string | number} x - The number to format.
 * @returns {string} The formatted number with spaces.
 */
export function numberWithSpaces(x: string | number): string {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return parts.join('.');
}

// Helper functions
/**
 * Extracts the first two non-zero digits from a string.
 * @param {string} value - The string to extract from.
 * @returns {string} The extracted digits.
 */
const extractFirstTwoNonZeroDigits = (value: string): string => {
  const match = value.match(/0*([1-9]\d?)/);
  return match ? `0.${match[0]}` : '0';
};

/**
 * Normalizes a number string to a specified decimal round-off.
 * @param {string} value - The number string to normalize.
 * @param {number} round - The number of decimals to round to.
 * @returns {string} The normalized number string.
 */
const normalizeNumber = (value: string, round: number): string => {
  const [integerPart, decimalPart] = value.split('.');

  if (!decimalPart) return integerPart;

  const roundedDecimalPart = decimalPart.slice(0, round);

  return `${integerPart}${BN(roundedDecimalPart).gt(0) ? `.${roundedDecimalPart}` : ''}`;
};
