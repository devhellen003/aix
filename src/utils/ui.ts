/**
 * Shortens a hash or string by keeping only the specified number of characters from the start and end.
 * @param {string} hash - The hash or string to shorten.
 * @param {number} [startLength=5] - The number of characters to keep from the start of the hash.
 * @param {number} [endLength=4] - The number of characters to keep from the end of the hash.
 * @returns {string} The shortened hash or string.
 */
export const shortenHash = (hash: string, startLength: number = 5, endLength: number = 4): string =>
  `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;

export const shortenText = (text: string, length: number) => {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};
