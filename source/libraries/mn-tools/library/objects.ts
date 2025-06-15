import { isArray, isDefined, isObject } from './is';

export const DATE_REGEXP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type TDictionary<T> = { [key: string]: T } | { [oid: number]: T };

/**
 * Make a shallow clone of the source object.
 *
 * @param object Object to clone.
 * @return A shallow copy of the object.
 */
export function clone<T>(object: T): T {
  if (object === undefined) return undefined as T;
  if (object === null) return null as T;
  if (isArray(object)) return object.slice(0) as unknown as T;
  const copy = Object.create(Object.getPrototypeOf(object));
  extend(copy, object);
  return copy;
}

/**
 * Make a deep clone of the source object.
 *
 * @param object Object to clone.
 * @return A deep copy of the object.
 */
export function deepClone<T>(object: T): T {
  return unserialize<T>(serialize(object));
}

/**
 * Deserialize a JSON string, converting date strings into Date objects.
 *
 * @param json JSON string.
 */
export function unserialize<T = unknown>(json: string): T {
  try {
    return JSON.parse(json, (_key, value) => {
      if (typeof value === 'string' && DATE_REGEXP.exec(value)) {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    // Add additional info to error if needed.
    (error as { more?: { json: string } }).more = { json };
    throw error;
  }
}

/**
 * Serialize data to a JSON string, omitting keys starting with '$'.
 *
 * @param data Data to serialize.
 */
export function serialize(data: unknown): string {
  return JSON.stringify(data, (k, v) => {
    if (typeof k === 'string' && k.length > 0 && k.charAt(0) === '$') return undefined;
    return v;
  });
}

/**
 * Convert any value to an array.
 * If the value is already an array, it is returned unchanged.
 *
 * @param x Source value.
 * @return An array containing the value(s).
 */
export function asArray<T>(x: T | T[]): T[] {
  return isArray(x) ? x : [x];
}

/**
 * Add default properties to an object.
 *
 * @param object Target object.
 * @param defaults List of default objects.
 * @return The augmented object.
 */
export function defaults<T>(object: T, ...args: Partial<T>[]): T {
  // Ensure object is an object; if not, assign an empty object.
  if (!object) object = {} as T;
  if (!isObject(object)) return object;
  for (const source of args) {
    for (const prop in source) {
      if ((object as Record<string, unknown>)[prop] === undefined) {
        (object as Record<string, unknown>)[prop] = source[prop] as unknown;
      }
    }
  }
  return object;
}

/**
 * Extend an object with properties from additional objects.
 *
 * @param object Target object.
 * @param sources List of source objects.
 * @return The extended object.
 */
export function extend<T>(object: T, ...sources: Partial<T>[]): T {
  if (!object) object = {} as T;
  if (!isObject(object)) return object;
  for (const source of sources) {
    for (const property in source) {
      if (Object.prototype.hasOwnProperty.call(source, property)) {
        (object as Record<string, unknown>)[property] = (source as Record<string, unknown>)[property];
      }
    }
  }
  return object;
}

/**
 * Deeply extends an object with multiple partial objects.
 *
 * @param target The target object to extend.
 * @param sources The partial objects to merge into the target.
 * @return The resulting deeply extended object.
 */
export function deepExtend<T>(target: T, ...sources: Partial<T>[]): T {
  if (!isObject(target)) {
    throw new Error('Target must be an object.');
  }

  for (const source of sources) {
    if (!isObject(source)) continue;

    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

      const sourceValue = source[key];
      const targetValue = (target as Record<string, unknown>)[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        // Recursive merge for nested objects
        deepExtend(targetValue, sourceValue);
      } else {
        // Direct assignment for non-object properties
        (target as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return target;
}

/**
 * Same as map but returns an array.
 *
 * @param source Source object.
 * @param iteratee Function to iterate over object properties.
 * @param context Optional context for the iteratee.
 * @return An array of values returned by iteratee.
 */
export function mapa<T, U>(source: Record<string, T>, iteratee: (item: T, key: string) => U, context?: unknown): U[] {
  if (source === null) return [];
  const boundIteratee = iteratee.bind(context);
  let result: U[] = [];
  for (const key in source) {
    if (isDefined(source[key])) result.push(boundIteratee(source[key]!, key));
  }
  return result;
}

/**
 * Check if an object owns a property.
 *
 * @param object Object to test.
 * @param key Property name to test.
 * @return True if object has the property.
 */
export function has(object: unknown, key: string): boolean {
  return object !== null && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key);
}

/**
 * Iterate over object properties.
 *
 * @param object Source object.
 * @param iteratee Function to call for each property.
 * @param context Optional context for the callback.
 */
export function each<T>(
  object: Record<string, T>,
  iteratee: (item: T, key: string) => boolean | void,
  context?: unknown
): void {
  if (object === null) return;
  const boundIteratee = iteratee.bind(context);
  const keysArray = Object.keys(object);
  for (let i = 0, length = keysArray.length; i < length; i++) {
    if (boundIteratee(object[keysArray[i]!]!, keysArray[i]!)) break;
  }
}

/**
 * Compute the difference between two arrays.
 *
 * @param o First array.
 * @param n Second array.
 * @return A tuple of arrays containing differences or undefined if none.
 */
export function arrayDiff<T>(o: T[], n: T[]): [T[], T[]] | undefined {
  const oCopy = o.slice(0);
  const nCopy = n.slice(0);
  for (let i = 0; i < oCopy.length; i++) {
    for (let j = 0; j < nCopy.length; j++) {
      if (oCopy[i] === nCopy[j]) {
        oCopy[i] = null as unknown as T;
        nCopy[j] = null as unknown as T;
      }
    }
  }
  const diffO = oCopy.filter((x) => x != null);
  const diffN = nCopy.filter((x) => x != null);
  if (diffO.length || diffN.length) return [diffO, diffN];
  return undefined;
}

/**
 * Compute the difference between two flat objects of the same type.
 *
 * @param o Old object.
 * @param n New object.
 * @returns A tuple [diffO, diffN] or undefined if no differences:
 *   - diffO: properties removed or changed in n
 *   - diffN: properties added or changed in n
 */
export function objectDiff<T extends object>(o: T, n: T): [Partial<T>, Partial<T>] | undefined {
  const diffO: Partial<T> = {};
  const diffN: Partial<T> = {};

  // Identify properties that were removed or changed
  for (const key of Object.keys(o) as (keyof T)[]) {
    if (!(key in n) || o[key] !== n[key]) {
      diffO[key] = o[key];
    }
  }

  // Identify properties that were added or changed
  for (const key of Object.keys(n) as (keyof T)[]) {
    if (!(key in o) || n[key] !== o[key]) {
      diffN[key] = n[key];
    }
  }

  // Return differences if any, otherwise undefined
  if (Object.keys(diffO).length || Object.keys(diffN).length) {
    return [diffO, diffN];
  }

  return undefined;
}

type KeyByPayload<T> = Partial<T>;

type KeyByCallback<T> = (item: KeyByPayload<T>) => string;

/**
 * Index an array of objects by a key.
 *
 * @template T
 * @param a Array of objects.
 * @param fieldOrCallback The field name or a callback to generate the key.
 * @return An object indexed by the key.
 */
export function keyBy<T>(a: T[], fieldOrCallback: keyof T | KeyByCallback<T>): { [key: string]: T } {
  const result: { [key: string]: T } = {};

  let callback: KeyByCallback<T>;
  if (typeof fieldOrCallback === 'string') {
    callback = (x) => String(x[fieldOrCallback]);
  } else {
    callback = fieldOrCallback as KeyByCallback<T>;
  }

  a.forEach((v) => (result[callback(v)] = v));
  return result;
}

/**
 * Converts an array of objects into a record indexed by a key property.
 * If allowOverride is true, duplicate keys are allowed and the last object wins.
 * If allowOverride is false (default), throws an error if a duplicate key is found.
 *
 * @param array - The array of objects to convert.
 * @param key - The property name to use as the record key. Must be string or number.
 * @param allowOverride - Whether to allow overriding existing keys (default: false).
 * @returns A record mapping each unique key to its corresponding object.
 * @throws If allowOverride is false and a duplicate key is found.
 */
export function arrayToRecord<T, K extends keyof T, KeyType extends Extract<T[K], string | number>>(
  array: T[],
  key: K,
  allowOverride: boolean = false
): Record<KeyType, T> {
  const record = {} as Record<KeyType, T>;
  for (const item of array) {
    const value = item[key];
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(`Key property "${String(key)}" must be of type string or number, got: ${typeof value}`);
    }
    if (!allowOverride && value in record) {
      throw new Error(`Duplicate key found: "${value}"`);
    }
    record[value as KeyType] = item;
  }
  return record;
}

/**
 * Groups an array of objects into a record keyed by a specified property.
 * If multiple objects share the same key value, they are all collected in an array.
 *
 * @param array - The array of objects to convert.
 * @param key - The property name to use as the record key. Must be of type string or number.
 * @returns A record mapping each unique key to an array of objects that have that key value.
 * @throws Error if a key property value is not a string or number.
 */
export function arrayToRecordMultiple<T, K extends keyof T, KeyType extends Extract<T[K], string | number>>(
  array: T[],
  key: K
): Record<KeyType, T[]> {
  const record = {} as Record<KeyType, T[]>;

  for (const item of array) {
    const value = item[key];
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(`Key property "${String(key)}" must be of type string or number, got: ${typeof value}`);
    }

    const mapKey = value as KeyType;
    if (!record[mapKey]) {
      record[mapKey] = [];
    }
    record[mapKey].push(item);
  }

  return record;
}

/**
 * Sort an array of objects by a field based on a given order.
 *
 * @param a Array of objects.
 * @param field Field name to index.
 * @param orderList The desired order.
 * @return A sorted array.
 */
export function sortBy<T>(a: T[], field: keyof T, orderList: unknown[]): T[] {
  const kb = keyBy(a, field);
  return orderList.map((x) => kb[String(x)]!);
}

/**
 * Group an array of objects by a key, accumulating values.
 *
 * @param a Array of objects.
 * @param fieldOrCallback Field name or callback to determine the key.
 * @return An object where each key maps to an array of objects.
 */
export function keyByAccumulated<T>(a: T[], fieldOrCallback: string | KeyByCallback<T>): { [key: string]: T[] } {
  const result: { [key: string]: T[] } = {};

  let callback: KeyByCallback<T>;
  if (typeof fieldOrCallback === 'string') {
    callback = ((x: { [key: string]: string }) => x[fieldOrCallback]) as unknown as KeyByCallback<T>;
  } else {
    callback = fieldOrCallback;
  }

  a.forEach((v) => {
    const key = callback(v);
    if (result[key] === undefined) {
      result[key] = [];
    }
    result[key]!.push(v);
  });
  return result;
}

type KeyByMultipleCallback<T> = (root: { [k: string]: unknown }, value: string, item: T) => void;

/**
 * Index an array of objects by multiple keys. Each record is an array to hold multiple objects with the same key.
 *
 * @param items Array of objects.
 * @param fieldsOrField Field name(s) to index.
 * @param aggregateOrNull Optional custom aggregator.
 * @return An object indexed by the key(s).
 */
export function keyByMultiple<T>(
  items: T[],
  fieldsOrField: string | string[],
  aggregateOrNull?: KeyByMultipleCallback<T>
): { [key: string]: T[] } {
  const fields = asArray(fieldsOrField);
  const aggregate: KeyByMultipleCallback<T> =
    aggregateOrNull ??
    ((root, value, item) => {
      if (root[value] === undefined) root[value] = [];
      (root[value] as T[]).push(item);
    });

  const result: { [k: string]: unknown } = {};
  const last = fields.length - 1;
  items.forEach((item) => {
    let root = result;
    for (let i = 0, length = fields.length; i < length; i++) {
      const key = fields[i]!;
      const keyStr = String((item as Record<string, unknown>)[key]);
      if (i < last) {
        if (!root[keyStr]) root[keyStr] = {};
        root = root[keyStr] as { [k: string]: unknown };
      } else {
        aggregate(root, keyStr, item);
      }
    }
  });

  return result as { [key: string]: T[] };
}

/**
 * Return the keys of an object.
 *
 * @param object The source object.
 * @return An array of keys.
 */
export function keys(object: unknown): string[] {
  if (!isObject(object)) return [];
  return Object.keys(object as object);
}

/**
 * Return all values of an object as an array.
 *
 * @param object The source object.
 * @return An array of values.
 */
export function values<T>(object: TDictionary<T>): T[] {
  const ks = keys(object);
  const length = ks.length;
  const vals: T[] = new Array(length);
  for (let i = 0; i < length; i++) {
    vals[i] = (object as Record<string, T>)[ks[i]!]!;
  }
  return vals;
}

/**
 * Monkey-patch an object by adding a method if it does not already exist.
 *
 * @param obj The target object.
 * @param name The property name.
 * @param fn The function to assign.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function monkeyPatch(obj: unknown, name: string, fn: Function): void {
  if (obj !== null && (typeof obj === 'object' || typeof obj === 'function') && !(name in obj)) {
    Object.defineProperty(obj, name, { value: fn });
  }
}

/**
 * Monkey-patch an object by adding a getter if it does not already exist.
 *
 * @param obj The target object.
 * @param name The property name.
 * @param fn An object containing a getter.
 */
export function monkeyPatchGet(obj: unknown, name: string, fn: { get: () => number }): void {
  if (obj !== null && (typeof obj === 'object' || typeof obj === 'function') && !(name in obj)) {
    Object.defineProperty(obj, name, fn);
  }
}

export type TForbidTypeChanges<T, U> = {
  [K in keyof T]: K extends keyof U ? (T[K] extends U[K] ? (U[K] extends T[K] ? T[K] : never) : never) : T[K];
};
