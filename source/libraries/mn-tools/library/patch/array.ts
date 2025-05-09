import { monkeyPatch } from '../..';

/**
 * Returns a new array containing only the elements that exist in both arrays.
 * Note: This implementation uses strict equality (===) for comparisons.
 *
 * @param b - The array to intersect with.
 * @returns A new array with the common elements.
 */
function arrayIntersect<T>(this: T[], b: T[]): T[] {
  return this.filter((x) => b.indexOf(x) !== -1);
}

/**
 * Returns a new array with duplicate values removed.
 *
 * @returns A new array containing only unique values.
 */
function arrayUniq<T>(this: T[]): T[] {
  return [...new Set(this)];
}

/**
 * Moves an element from one index to another within the array.
 * Modifies the array in-place and returns it.
 *
 * @param fromIndex - The index of the element to move.
 * @param toIndex - The target index where the element should be placed.
 * @returns The modified array.
 */
function arrayMove<T>(this: T[], fromIndex: number, toIndex: number): T[] {
  // Check if indices are within bounds
  if (fromIndex < 0 || fromIndex >= this.length) {
    throw new Error('fromIndex is out of bounds.');
  }
  if (toIndex < 0 || toIndex > this.length) {
    throw new Error('toIndex is out of bounds.');
  }
  const element = this[fromIndex]!;
  this.splice(fromIndex, 1);
  this.splice(toIndex, 0, element);
  return this;
}

/**
 * Splits the array into chunks of the specified size.
 *
 * @param size - The maximum size of each chunk. Must be greater than 0.
 * @returns An array of chunks (arrays).
 */
function arrayChunk<T>(this: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0.');

  const result: T[][] = [];
  for (let i = 0; i < this.length; i += size) {
    result.push(this.slice(i, i + size));
  }
  return result;
}

export function install() {
  monkeyPatch(Array.prototype, 'uniq', arrayUniq);
  monkeyPatch(Array.prototype, 'intersect', arrayIntersect);
  monkeyPatch(Array.prototype, 'chunk', arrayChunk);
  monkeyPatch(Array.prototype, 'move', arrayMove);
}

declare global {
  interface Array<T> {
    /**
     * Returns a new array with duplicate values removed.
     */
    uniq(): T[];

    /**
     * Returns a new array containing only the elements that exist in both arrays.
     *
     * @param b - The array to intersect with.
     */
    intersect(b: T[]): T[];

    /**
     * Splits the array into chunks of the specified size.
     *
     * @param size - The maximum size of each chunk.
     */
    chunk(size: number): T[][];

    /**
     * Moves an element from one index to another within the array.
     *
     * @param from - The index of the element to move.
     * @param to - The target index where the element should be placed.
     */
    move(from: number, to: number): T[];
  }
}
