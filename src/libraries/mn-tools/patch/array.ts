import { monkeyPatch } from "..";

function arrayIntersect<T>(this: T[], b: T[]) {
  return this.filter(x => b.indexOf(x) !== -1);
}

function arrayUniq<T>(this: T[]) {
  let tmp : any = {};
  this.forEach((v) => {
    tmp[v as any] = true;
  });

  return Object.keys(tmp);
}

// eslint-disable-next-line no-unused-vars
function arrayFind<T>(this: T[], predicate: (item: T, index: number, o: Object)=>boolean, context?: any) : T | undefined {
  if (this == null) throw new TypeError('"this" is null or not defined');
  let o = Object(this);
  // eslint-disable-next-line no-bitwise
  let len = o.length >>> 0;
  if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
  let k = 0;
  while (k < len) {
    let kValue = o[k];
    if (predicate.call(context, kValue, k, o)) return kValue;
    k++;
  }

  return undefined;
}

function arrayContains<T>(this: T[], item: T): boolean {
  return this.indexOf(item)!==-1;
}

function arrayRemove<T>(this: T[], item: T) : T[] | void {
  let index = this.indexOf(item);
  if (index===-1) return;
  // eslint-disable-next-line consistent-return
  return this.splice(index, 1);
}

function arrayMove<T>(this: T[], fromIndex: number, toIndex: number) {
  let element = this[fromIndex];
  this.splice(fromIndex, 1);
  this.splice(toIndex, 0, element);
  return this;
}

function arrayChunk<T>(this: T[], size: number) {
  let result : T[][] = [];
  let i = 0;
  for (let j = this.length; i<j; i+=size) {
    result.push(this.slice(i,i+size));
  }
  return result;
}

export function install() {
  monkeyPatch(Array.prototype, 'find', arrayFind);
  monkeyPatch(Array.prototype, 'uniq', arrayUniq);
  monkeyPatch(Array.prototype, 'intersect', arrayIntersect);
  monkeyPatch(Array.prototype, 'contains', arrayContains);
  monkeyPatch(Array.prototype, 'remove', arrayRemove);
  monkeyPatch(Array.prototype, 'chunk', arrayChunk);
  monkeyPatch(Array.prototype, 'move', arrayMove);
}



declare global {
  interface Array<T> {
    // eslint-disable-next-line no-shadow
    intersect<T>(b: T[]): T[];
    uniq(): T[];
    find(predicate: (item: T, index?: number) => boolean): T;
    contains(item: T): boolean;
    remove(item: T): T;
    move(from: number, to: number): T[];
  }
}
