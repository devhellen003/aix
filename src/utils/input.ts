/**
 * Sanitizes and formats a string to a numeric format.
 * - Removes non-numeric characters except for dots and commas.
 * - Replaces commas with dots.
 * - Retains only the first dot for decimal numbers.
 * - Formats leading zeros.
 * @param val - The string value to format.
 * @returns The formatted string adhering to numeric input rules.
 */
export const numberInputReg = (val: string): string => {
  return val
    .replace(/[^0-9.,]/g, '') // Remove non-numeric characters except for dots and commas
    .replace(/,/g, '.') // Replace commas with dots
    .replace(/(\..*?)\..*/g, '$1') // Keep only the first dot for decimal numbers
    .replace(/(,.*?),.*/g, '$1') // Redundant for comma handling after replacing them with dots
    .replace(/^0+/g, '0') // Format leading zeros
    .replace(/^0(?=\d)/, '') // Remove leading zero before a number
    .replace(/^\./, '0.'); // Add leading zero for decimal numbers starting with a dot
};
