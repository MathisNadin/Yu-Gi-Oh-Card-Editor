import { expect } from '@jest/globals';

import {
  DATE_REGEXP,
  clone,
  deepClone,
  unserialize,
  serialize,
  asArray,
  defaults,
  extend,
  deepExtend,
  mapa,
  has,
  each,
  arrayDiff,
  keyBy,
  sortBy,
  keyByAccumulated,
  keyByMultiple,
  keys,
  values,
  monkeyPatch,
  monkeyPatchGet,
  objectDiff,
  arrayToRecord,
  arrayToRecordMultiple,
  deepFreeze,
} from '../library/objects';

describe('objects.ts utility functions', () => {
  // DATE_REGEXP: verify it matches valid ISO date strings.
  describe('DATE_REGEXP', () => {
    it('should match valid ISO date strings', () => {
      const validDate = '2023-04-12T12:34:56.789Z';
      expect(DATE_REGEXP.test(validDate)).toBe(true);
    });
    it('should not match invalid date strings', () => {
      const invalidDate = '2023-04-12 12:34:56';
      expect(DATE_REGEXP.test(invalidDate)).toBe(false);
    });
  });

  describe('deepFreeze', () => {
    it('should deeply freeze a nested object and prevent modification', () => {
      const obj = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: [{ f: 5 }],
      };
      const frozen = deepFreeze(obj);

      // Check that all levels are frozen
      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.b)).toBe(true);
      expect(Object.isFrozen(frozen.b.d)).toBe(true);
      expect(Object.isFrozen(frozen.e)).toBe(true);
      expect(Object.isFrozen(frozen.e[0])).toBe(true);

      // Mutation attempts: must throw TypeError
      expect(() => {
        frozen.a = 100;
      }).toThrow(TypeError);
      expect(() => {
        frozen.b.c = 200;
      }).toThrow(TypeError);
      expect(() => {
        frozen.b.d[0] = 999;
      }).toThrow(TypeError);
      expect(() => {
        frozen.e[0]!.f = 42;
      }).toThrow(TypeError);

      // Add new property: must throw
      expect(() => {
        (frozen as { x?: number }).x = 999;
      }).toThrow(TypeError);

      // Ensure values are unchanged
      expect(frozen.a).toBe(1);
      expect(frozen.b.c).toBe(2);
      expect(frozen.b.d[0]).toBe(3);
      expect(frozen.e[0]!.f).toBe(5);
      expect((frozen as { x?: number }).x).toBeUndefined();
    });

    it('should deeply freeze symbol properties', () => {
      const sym = Symbol('test');
      const obj = { a: 1, [sym]: { b: 2 } };
      const frozen = deepFreeze(obj);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen[sym])).toBe(true);

      // Try to mutate symbol property: must throw
      expect(() => {
        (frozen[sym] as { b: number }).b = 42;
      }).toThrow(TypeError);
      expect(frozen[sym].b).toBe(2);
    });
  });

  // clone: shallow clone of an object or array.
  describe('clone', () => {
    it('should return undefined when cloning undefined', () => {
      expect(clone(undefined)).toBeUndefined();
    });
    it('should return null when cloning null', () => {
      expect(clone(null)).toBeNull();
    });
    it('should perform a shallow clone for arrays', () => {
      const arr = [1, 2, 3];
      const cloned = clone(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned).toEqual(arr);
    });
    it('should perform a shallow clone for objects', () => {
      interface ObjType {
        a: number;
        b: { c: number };
      }
      const obj: ObjType = { a: 1, b: { c: 2 } };
      const cloned = clone(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned).toEqual(obj);
      // Shallow clone: nested object remains the same reference.
      expect(cloned.b).toBe(obj.b);
    });
  });

  // deepClone: deep clone of an object.
  describe('deepClone', () => {
    it('should create a deep clone of an object', () => {
      interface ObjType {
        a: number;
        b: { c: number };
      }
      const obj: ObjType = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned).toEqual(obj);
      // Deep clone: nested object should not be the same reference.
      expect(cloned.b).not.toBe(obj.b);
    });
  });

  // unserialize: JSON parsing with date conversion.
  describe('unserialize', () => {
    it('should parse JSON and convert ISO date strings to Date objects', () => {
      const json = '{"date": "2023-04-12T12:34:56.789Z", "value": 42}';
      const result = unserialize<{ date: Date; value: number }>(json);
      expect(result.value).toBe(42);
      expect(result.date instanceof Date).toBe(true);
      expect(result.date.toISOString()).toBe('2023-04-12T12:34:56.789Z');
    });
    it('should throw an error for invalid JSON', () => {
      expect(() => unserialize('invalid json')).toThrow();
    });
  });

  // serialize: JSON.stringify omitting keys starting with '$'.
  describe('serialize', () => {
    it('should serialize an object and omit keys starting with "$"', () => {
      const obj = { a: 1, $b: 2, c: { $d: 3, e: 4 } };
      const json = serialize(obj);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual({ a: 1, c: { e: 4 } });
    });
  });

  // asArray: ensure any value is returned as an array.
  describe('asArray', () => {
    it('should return the same array if input is already an array', () => {
      const input = [1, 2, 3];
      const result = asArray(input);
      expect(result).toBe(input);
    });
    it('should wrap a single value in an array if input is not an array', () => {
      const input = 1;
      const result = asArray(input);
      expect(result).toEqual([1]);
    });
  });

  // defaults: assign default properties if missing.
  describe('defaults', () => {
    interface AB {
      a: number;
      b?: number;
    }
    it('should assign missing properties from defaults', () => {
      const target: AB = { a: 1 };
      const source: Partial<AB> = { b: 2 };
      const result = defaults(target, source);
      expect(result).toEqual({ a: 1, b: 2 });
    });
    it('should create a new object if target is falsy', () => {
      const result = defaults(null, { a: 1 } as unknown as null);
      expect(result).toEqual({ a: 1 });
    });
  });

  // extend: shallow merge properties from sources.
  describe('extend', () => {
    interface Obj {
      a: number;
      b?: number;
    }
    it('should extend target object with source properties', () => {
      const target: Obj = { a: 1 };
      const source: Partial<Obj> = { b: 2 };
      const result = extend(target, source);
      expect(result).toEqual({ a: 1, b: 2 });
    });
    it('should override properties if they exist in the source', () => {
      const target: Obj = { a: 1 };
      const source: Partial<Obj> = { a: 100, b: 2 };
      const result = extend(target, source);
      expect(result.a).toBe(100);
      expect(result.b).toBe(2);
    });
  });

  // deepExtend: deep merge objects recursively.
  describe('deepExtend', () => {
    interface Obj {
      a: number;
      b: { c: number; d?: number } | number;
    }
    it('should deeply merge nested objects', () => {
      const target: Obj = { a: 1, b: { c: 2 } };
      const source: Partial<Obj> = { b: { c: 2, d: 3 } };
      const result = deepExtend(target, source);
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 } });
    });
    it('should override non-object properties', () => {
      const target: Obj = { a: 1, b: { c: 2 } };
      const source: Partial<Obj> = { b: 100 };
      const result = deepExtend(target, source);
      expect(result).toEqual({ a: 1, b: 100 });
    });
    it('should throw error if target is not an object', () => {
      // Explicitly cast via unknown
      expect(() => deepExtend<number | {}>(123 as unknown as {}, {})).toThrow();
    });
  });

  // mapa: mapping over object properties.
  describe('mapa', () => {
    it('should return an array of mapped values', () => {
      const source: Record<string, number> = { a: 1, b: 2, c: 3 };
      const result = mapa(source, (item, _key) => `${_key}:${item}`);
      expect(result.sort()).toEqual(['a:1', 'b:2', 'c:3'].sort());
    });
    it('should bind the given context to the iteratee', () => {
      const source: Record<string, number> = { a: 1 };
      const context = { multiplier: 10 };
      const result = mapa(
        source,
        function (this: { multiplier: number }, item: number, _key: string): number {
          return item * this.multiplier;
        },
        context
      );
      expect(result).toEqual([10]);
    });
  });

  // has: check if an object has a given property.
  describe('has', () => {
    it('should return true if the object has the property', () => {
      const obj = { a: 1 };
      expect(has(obj, 'a')).toBe(true);
    });
    it('should return false if the object does not have the property', () => {
      const obj = { a: 1 };
      expect(has(obj, 'b')).toBe(false);
    });
    it('should return false if the argument is not an object', () => {
      expect(has(123, 'a')).toBe(false);
    });
  });

  // each: iterate over object properties with possibility of early exit.
  describe('each', () => {
    it('should iterate over all properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keysVisited: string[] = [];
      each(obj, (_item, key) => {
        keysVisited.push(key);
      });
      expect(keysVisited.sort()).toEqual(Object.keys(obj).sort());
    });
    it('should break iteration when iteratee returns true', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keysVisited: string[] = [];
      each(obj, (_item, key) => {
        keysVisited.push(key);
        return key === 'b';
      });
      expect(keysVisited).toContain('b');
      expect(keysVisited.length).toBeLessThanOrEqual(Object.keys(obj).length);
    });
  });

  // arrayDiff: compute the differences between two arrays.
  describe('arrayDiff', () => {
    it('should return the differences between two arrays', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5];
      const result = arrayDiff(arr1, arr2);
      expect(result).toEqual([[1, 2], [5]]);
    });
    it('should return undefined when arrays are identical', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(arrayDiff(arr1, arr2)).toBeUndefined();
    });
  });

  // objectDiff: compute the differences between two objects.
  describe('objectDiff', () => {
    it('should return the differences between two flat objects', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 20, d: 4 };
      const result = objectDiff<{ a: number; b: number; c?: number; d?: number }>(obj1, obj2);
      expect(result).toEqual([
        // diffO: properties removed or changed in obj2
        { b: 2, c: 3 },
        // diffN: properties added or changed in obj2
        { b: 20, d: 4 },
      ]);
    });

    it('should return undefined when objects are identical', () => {
      const obj1 = { x: 'foo', y: 'bar' };
      const obj2 = { x: 'foo', y: 'bar' };
      expect(objectDiff(obj1, obj2)).toBeUndefined();
    });
  });

  // keyBy: index an array of objects by a property or a callback.
  describe('keyBy', () => {
    interface User {
      id: number;
      name: string;
    }
    const users: User[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    it('should index the array by a given field', () => {
      const indexed = keyBy(users, 'id');
      expect(Object.keys(indexed).sort()).toEqual(['1', '2'].sort());
      expect(indexed['1']).toEqual(users[0]);
    });
    it('should index the array using a callback', () => {
      // Using non-null assertion for user.name.
      const indexed = keyBy(users, (user: Partial<User>) => user.name!.toLowerCase());
      expect(Object.keys(indexed).sort()).toEqual(['alice', 'bob'].sort());
      expect(indexed['bob']).toEqual(users[1]);
    });
  });

  // arrayToRecord: create a record from an array of objects by a property.
  describe('arrayToRecord', () => {
    interface User {
      id: number;
      name: string;
    }
    const users: User[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];

    it('should index the array by a given field (no override, default)', () => {
      const indexed = arrayToRecord(users, 'id');
      expect(indexed).toEqual({
        1: { id: 1, name: 'Alice' },
        2: { id: 2, name: 'Bob' },
      });
    });

    it('should throw if duplicate keys are found and allowOverride is false', () => {
      const duplicate = [
        { id: 1, name: 'A' },
        { id: 1, name: 'B' },
      ];
      expect(() => arrayToRecord(duplicate, 'id')).toThrow('Duplicate key found: "1"');
      expect(() => arrayToRecord(duplicate, 'id', false)).toThrow('Duplicate key found: "1"');
    });

    it('should override previous values with later ones if allowOverride is true', () => {
      const duplicate = [
        { id: 1, name: 'A' },
        { id: 1, name: 'B' },
        { id: 2, name: 'C' },
      ];
      const indexed = arrayToRecord(duplicate, 'id', true);
      expect(indexed).toEqual({
        1: { id: 1, name: 'B' }, // Last one with id 1
        2: { id: 2, name: 'C' },
      });
    });

    it('should throw if key type is invalid', () => {
      const weird = [{ id: {}, name: 'C' }];
      expect(() => arrayToRecord(weird, 'id')).toThrow(
        'Key property "id" must be of type string or number, got: object'
      );
    });

    it('should work with string keys and allowOverride', () => {
      const items = [
        { slug: 'foo', value: 1 },
        { slug: 'bar', value: 2 },
        { slug: 'foo', value: 3 },
      ];
      const result = arrayToRecord(items, 'slug', true);
      expect(result).toEqual({
        foo: { slug: 'foo', value: 3 },
        bar: { slug: 'bar', value: 2 },
      });
    });
  });

  // arrayToRecordMultiple: create a record from an array of objects by a property while grouping objects with the same property
  describe('arrayToRecordMultiple', () => {
    interface User {
      id: number;
      name: string;
    }

    const users: User[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];

    it('should group items by a numeric key when all keys are unique', () => {
      const result = arrayToRecordMultiple(users, 'id');
      expect(result).toEqual({
        1: [{ id: 1, name: 'Alice' }],
        2: [{ id: 2, name: 'Bob' }],
      });
    });

    it('should collect multiple items under the same numeric key', () => {
      const duplicateUsers: User[] = [
        { id: 1, name: 'A' },
        { id: 1, name: 'B' },
        { id: 2, name: 'C' },
        { id: 1, name: 'D' },
      ];
      const result = arrayToRecordMultiple(duplicateUsers, 'id');
      expect(result).toEqual({
        1: [
          { id: 1, name: 'A' },
          { id: 1, name: 'B' },
          { id: 1, name: 'D' },
        ],
        2: [{ id: 2, name: 'C' }],
      });
    });

    it('should group items by a string key', () => {
      interface Item {
        slug: string;
        value: number;
      }
      const items: Item[] = [
        { slug: 'apple', value: 10 },
        { slug: 'banana', value: 20 },
        { slug: 'apple', value: 30 },
      ];
      const result = arrayToRecordMultiple(items, 'slug');
      expect(result).toEqual({
        apple: [
          { slug: 'apple', value: 10 },
          { slug: 'apple', value: 30 },
        ],
        banana: [{ slug: 'banana', value: 20 }],
      });
    });

    it('should return an empty record when given an empty array', () => {
      const empty: User[] = [];
      const result = arrayToRecordMultiple(empty, 'id');
      expect(result).toEqual({});
    });

    it('should throw if a key property value is neither string nor number', () => {
      interface Bad {
        id: object;
        name: string;
      }
      const badArray: Bad[] = [{ id: {}, name: 'X' }];
      expect(() => arrayToRecordMultiple(badArray, 'id')).toThrowError(
        'Key property "id" must be of type string or number, got: object'
      );
    });
  });

  // sortBy: sort an array of objects according to a given order.
  describe('sortBy', () => {
    interface Item {
      id: number;
      value: string;
    }
    const items: Item[] = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 3, value: 'c' },
    ];
    it('should sort items based on the provided order list', () => {
      const orderList = [3, 1, 2];
      const sorted = sortBy(items, 'id', orderList);
      expect(sorted).toEqual([
        { id: 3, value: 'c' },
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ]);
    });
  });

  // keyByAccumulated: group items by a key (given as field name or callback).
  describe('keyByAccumulated', () => {
    interface Person {
      gender: string;
      name: string;
    }
    const people: Person[] = [
      { gender: 'male', name: 'John' },
      { gender: 'female', name: 'Alice' },
      { gender: 'male', name: 'Bob' },
    ];
    it('should group people by gender', () => {
      const grouped = keyByAccumulated(people, 'gender');
      expect(grouped.male).toBeDefined();
      expect(grouped.female).toBeDefined();
      expect(grouped.male?.length).toBe(2);
      expect(grouped.female?.length).toBe(1);
    });
  });

  // keyByMultiple: index an array of objects by multiple keys.
  describe('keyByMultiple', () => {
    interface Product {
      category: string;
      type: string;
      id: number;
    }
    const products: Product[] = [
      { category: 'Electronics', type: 'Laptop', id: 1 },
      { category: 'Electronics', type: 'Phone', id: 2 },
      { category: 'Furniture', type: 'Chair', id: 3 },
      { category: 'Electronics', type: 'Laptop', id: 4 },
    ];
    it('should index products by multiple keys', () => {
      const result = keyByMultiple(products, ['category', 'type']);
      expect(result['Electronics']).toBeDefined();
      // Convert the nested value explicitly.
      const electronicsGroup = result['Electronics'] as unknown as Record<string, Product[]>;
      const electronicsLaptops = electronicsGroup['Laptop'];
      expect(electronicsLaptops?.length).toBe(2);
    });
  });

  // keys: return the keys of an object.
  describe('keys', () => {
    it('should return an empty array for non-objects', () => {
      expect(keys(42)).toEqual([]);
    });
    it('should return the keys for an object', () => {
      const obj = { a: 1, b: 2 };
      expect(keys(obj).sort()).toEqual(['a', 'b'].sort());
    });
  });

  // values: return all values of an object as an array.
  describe('values', () => {
    it('should return the values for an object', () => {
      const obj = { a: 1, b: 2 };
      const vals = values<number>(obj);
      expect(vals.sort()).toEqual([1, 2].sort());
    });
  });

  // monkeyPatch: add a method if it does not already exist.
  describe('monkeyPatch', () => {
    it('should add a method to an object if not already defined', () => {
      interface Target {
        getAnswer?: () => number;
      }
      const target: Target = {};
      const fn = (): number => 42;
      monkeyPatch(target, 'getAnswer', fn);
      expect(typeof target.getAnswer).toBe('function');
      expect(target.getAnswer && target.getAnswer()).toBe(42);
    });
    it('should not overwrite an existing property', () => {
      interface Target {
        existing: () => string;
      }
      const target: Target = { existing: () => 'old' };
      const fn = (): string => 'new';
      monkeyPatch(target, 'existing', fn);
      expect(target.existing()).toBe('old');
    });
  });

  // monkeyPatchGet: add a getter if not already defined.
  describe('monkeyPatchGet', () => {
    it('should add a getter to an object if not already defined', () => {
      interface Target {
        dynamic?: number;
      }
      const target: Target = {};
      monkeyPatchGet(target, 'dynamic', { get: () => 100 });
      expect(target.dynamic).toBe(100);
    });
    it('should not overwrite an existing property with a getter', () => {
      interface Target {
        dynamic: number;
      }
      const target: Target = { dynamic: 200 };
      monkeyPatchGet(target, 'dynamic', { get: () => 100 });
      expect(target.dynamic).toBe(200);
    });
  });
});
