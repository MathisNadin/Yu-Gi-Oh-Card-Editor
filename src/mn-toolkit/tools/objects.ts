/* eslint-disable no-use-before-define */
/* eslint-disable no-void */
/* eslint-disable guard-for-in */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prettier/prettier */
import { asArray } from ".";
import { isArray, isObject } from "./is";

const DATE_REGEXP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type __Dictionary<T> = { [key: string]: T } | { [oid: number]: T };
/**
 * Make a clone of the source object.
 *
 * @param object object to clone
 * @return resulting clone
 */
export function clone<T>(object: T): T {
  if (object === undefined) return undefined as T;
  if (object === null) return null as T;
  if (isArray(object)) return (object as any).slice(0);
  let copy = Object.create(Object.getPrototypeOf(object));
  extend(copy, object);
  return copy;
}


/**
 * Make a deep clone of the source object.
 *
 * @param object object to clone
 * @return resulting clone
 */
export function deepClone<T>(object: T): T {
  return unserialize(serialize(object));
}

export function unserialize(json: string) {
  try {
    return JSON.parse(json, (_key, value) => {
      if (typeof value === 'string' && DATE_REGEXP.exec(value)) {
        // let ns = value.substr(0, value.length- 1)+'-07:00';
        // console.log(ns);
        // return new Date(ns);
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    (error as any).more = { json };
    throw error;
  }
}


export function serialize(data: any) {
  return JSON.stringify(data, (k, v) => {
    if (typeof k === 'string' && k.length > 0 && k.charAt(0) === '$') return undefined;
    return v;
  });
}


/**
 * Add default properties to an object.
 *
 * @param object target object
 * @param defaults list of defaults objects
 * @return Resulting augmented object
 */
export function defaults<T>(object: T, ...args: Partial<T>[]): T {
  if (!object) (object as any) = {};
  if (!isObject(object)) return object;
  for (let source of args) {
    for (let prop in source) {
      if (object[prop] === void 0) object[prop] = source[prop] as any;
    }
  }
  return object;
}


/**
 * Extend an object properties.
 *
 * @param object target object
 * @param defaults list of extender objects
 * @return resulting augmented object
 */
export function extend<T>(object: T, ...args: Partial<T>[]): T {
  if (!object) (object as any) = {};
  if (!isObject(object))
    return object;
  let property;
  for (let source of args) {
    for (property in source) {
      if (source.hasOwnProperty(property)) {
        (object as any)[property] = (source as any)[property];
      }
    }
  }
  return object;
}

/**
 * Same as @see _#map but returns an array.
 *
 * @param source source array to filter
 * @param iteratee source array to filter
 * @param context
 * @return the array
 */
export function mapa<T>(source: { [key: string]: T }, iteratee: (item: T, key?: string) => any, context?: any): any[] {
  if (source === null) return [];
  // eslint-disable-next-line no-restricted-syntax
  iteratee = iteratee.bind(context);
  let result = [];
  for (let i in source) {
    result.push(iteratee(source[i], i));
  }
  return result;
}


/**
 * Check if an object own a property.
 *
 * @param object object to test
 * @param key property name to test
 * @return true is it owns it
 */
export function has(object: any, key: string): boolean {
  return object !== null && object.hasOwnProperty(key);
}


/**
 * Iterate over object properties
 *
 * @param object source object
 * @param iteratee function that will iterate
 * @param context a context to apply the callback to
 */
export function each<T>(object: { [key: string]: T }, iteratee: (item: T, key: string) => boolean | void, context?: any): void {
  if (object === null) return;
  // eslint-disable-next-line no-restricted-syntax
  iteratee = iteratee.bind(context);
  let ks = Object.keys(object);
  for (let i = 0, length = ks.length; i < length; i++) {
    if (iteratee(object[ks[i]], ks[i]))
      break;
  }
}

// FIXME: n'a rien à faire ici
export function diff(o: any[], n: any[]) {
  o = o.slice(0);
  n = n.slice(0);
  for (let i = 0; i < o.length; i++) {
    for (let j = 0; j < n.length; j++) {
      if (n[j] && o[i] && o[i] === n[j]) {
        o[i] = null;
        n[j] = null;
      }
    }
  }
  o = o.filter(x => !!x);
  n = n.filter(x => !!x);
  if (o.length || n.length) return [o, n];
  return undefined;
}


type KeyByPayload<T> = Partial<T>;

type KeyByCallback<T> = (item: KeyByPayload<T>) => string;
/**
 * Index an array of object by key
 * FIXME: n'a rien à faire ici
 *
 * @template T
 * @param {T[]} a array of objects
 * @param {string} field the field to index
 * @return {Object.<string,T>} index object
 */
export function keyBy<T>(a: T[], fieldOrCallback: keyof T | KeyByCallback<T>): { [key: string]: T } {
  let result: { [key: string]: T } = {};
  let callback: KeyByCallback<T>;
  if (typeof fieldOrCallback === 'string') {
    callback = x => x[fieldOrCallback] as any;
  } else {
    callback = fieldOrCallback as KeyByCallback<T>;
  }
  a.forEach((v: T) => {
    result[callback(v)] = v;
  });
  return result;
}

export function sortBy<T>(a: T[], field: keyof T, orderList: any[]) {
  let kb = keyBy(a, field);
  return orderList.map(x => kb[x]);
}

export function keyByAccumulated<T>(a: T[], fieldOrCallback: string | KeyByCallback<T>): { [key: string]: T[] } {
  let result: { [key: string]: T[] } = {};
  let callback: KeyByCallback<T>;
  if (typeof fieldOrCallback === 'string') {
    callback = ((x: { [key: string]: string }) => x[fieldOrCallback]) as unknown as KeyByCallback<T>;
  } else {
    callback = fieldOrCallback;
  }
  a.forEach((v: T) => {
    if (typeof (result[callback(v)]) === 'undefined') {
      result[callback(v)] = [];
    }
    result[callback(v)].push(v);
  });
  return result;
}

type keyByMultipleCallback<T> = (root: { [k: string]: any }, value: string, item: T) => void;
/**
 * Index an array of object by key. Each record is itself an array so
 * the function conserve multiple objects with the same key.
 *
 * @param items array of objects
 * @param field the field to index
 * @return index object
 */
export function keyByMultiple<T>(items: T[], fieldsOrField: string | string[], aggregateOrNull?: keyByMultipleCallback<T>): { [key: string]: T[] } {
  let fields = asArray(fieldsOrField);
  let aggregate: keyByMultipleCallback<T>;
  if (typeof aggregateOrNull === 'undefined') {
    aggregate = (root, value, item) => {
      if (typeof root[value] === 'undefined') root[value] = [];
      root[value].push(item);
    };
  } else {
    aggregate = aggregateOrNull;
  }
  let result: { [k: string]: any } = {};
  let last = fields.length - 1;
  items.forEach(item => {
    let root = result;
    for (let i = 0, length = fields.length; i < length; i++) {
      let key = fields[i];
      if (i < last) {
        if (!root[(item as any)[key] as string]) root[(item as any)[key] as string] = {};
        root = root[(item as any)[key] as string];
      } else {
        aggregate(root, (item as any)[key] as string, item);
      }
    }
  });
  return result;
}

/**
 * Return the keys of an object.
 *
 * @param object the object
 * @return the keys
 */
 export function keys(object: any): string[] {
  if (!isObject(object))
    return [];
  if (Object.keys)
    return Object.keys(object);
  let keys = [];
  for (let key in object)
    if (has(object, key))
      keys.push(key);
  return keys;
}

/**
 * Return all values of an object as an array.
 *
 * @param object source object
 * @return array of values
 */
export function values<T>(object: __Dictionary<T>): T[] {
  let ks = keys(object);
  let length = ks.length;
  let values: T[] = Array(length);
  for (let i = 0; i < length; i++) {
    values[i] = (object as any)[ks[i]];
  }
  return values;
}


export function monkeyPatch(obj: any, name: string, fn: Function) {
  if (!(name in obj)) {
    Object.defineProperty(obj, name, { value: fn });
  }
}

export function monkeyPatchGet(obj: any, name: string, fn: {get: () => number}) {
  if (!(name in obj)) {
    Object.defineProperty(obj, name, fn);
  }
}
