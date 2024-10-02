/**
 * Filters and returns every Nth element from an array.
 * @param {T[]} arr - The array to filter through.
 * @param {number} nth - The interval to pick elements (e.g., every 2nd, 3rd element).
 * @param {number} [start=0] - The starting index offset.
 * @returns {T[]} A new array containing every Nth element.
 * @template T - The type of elements in the array.
 */
export const getEveryNth = <T>(arr: T[], nth: number, start: number = 0): T[] =>
  arr.filter((e, i) => (i + start) % nth === nth - 1);

/**
 * Creates a matrix (2D array) from a 1D array by grouping elements into rows.
 * @param {T[]} arr - The array to transform into a matrix.
 * @param {number} rowLength - The length of each row in the matrix.
 * @returns {T[][]} A matrix (2D array) where each inner array is a row of length `rowLength`.
 * @template T - The type of elements in the array.
 */
export const createMatrix = <T>(arr: T[], rowLength: number): T[][] => {
  const matrix: T[][] = [];

  for (let i = 0; i < arr.length; i += rowLength) {
    const row = arr.slice(i, i + rowLength);
    matrix.push(row);
  }

  return matrix;
};
