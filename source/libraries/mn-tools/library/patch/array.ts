import { monkeyPatch } from '../..';

function arrayIntersect<T>(this: T[], b: T[]) {
  return this.filter((x) => b.indexOf(x) !== -1);
}

function arrayUniq<T>(this: T[]) {
  return [...new Set(this)];
}

function arrayMove<T>(this: T[], fromIndex: number, toIndex: number) {
  const element = this[fromIndex];
  this.splice(fromIndex, 1);
  this.splice(toIndex, 0, element);
  return this;
}

function arrayChunk<T>(this: T[], size: number) {
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
    uniq(): T[];
    intersect<T>(b: T[]): T[];
    chunk(size: number): T[][];
    move(from: number, to: number): T[];
  }
}
