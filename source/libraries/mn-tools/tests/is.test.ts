import {
  hasKeys,
  isClass,
  isFunction,
  isString,
  isNumber,
  isDate,
  isArray,
  isError,
  isUndefined,
  isDefined,
  isNumeric,
  isInteger,
  isObject,
  isBoolean,
  isEmpty,
  isMinimumLength,
  isEquals,
  isDifferent,
  isDeepEqual,
  isRegexp,
  isEmail,
  isPhoneNumber,
  isUuid,
  isFloat,
} from '../library/is';

describe('Utility Functions Tests', () => {
  // Test for hasKeys
  describe('hasKeys', () => {
    it('should return false for empty objects', () => {
      // Test with an empty object: should return false
      expect(hasKeys({})).toBe(false);
    });

    it('should return true for objects with properties', () => {
      // Test with a non-empty object: should return true
      expect(hasKeys({ key: 'value' })).toBe(true);
    });
  });

  // Test for isClass
  describe('isClass', () => {
    it('should return true when the subject is a class', () => {
      // Define a dummy class for testing
      class TestClass {}
      expect(isClass(TestClass)).toBe(true);
    });

    it('should return false for regular functions', () => {
      // A regular function should not be considered as a class
      function regularFunction() {}
      expect(isClass(regularFunction)).toBe(false);
    });

    it('should return false for plain objects', () => {
      // A plain object is not a class
      expect(isClass({})).toBe(false);
    });
  });

  // Test for isFunction
  describe('isFunction', () => {
    it('should return true for functions', () => {
      // A simple arrow function should be identified as a function
      const fn = () => {};
      expect(isFunction(fn)).toBe(true);
    });

    it('should return false for non-function types', () => {
      // Numbers and objects are not functions
      expect(isFunction(123)).toBe(false);
      expect(isFunction({})).toBe(false);
    });
  });

  // Test for isString
  describe('isString', () => {
    it('should return true for strings', () => {
      // A basic string should return true
      expect(isString('hello')).toBe(true);
    });

    it('should return false for non-string types', () => {
      // A number is not a string
      expect(isString(123)).toBe(false);
    });
  });

  // Test for isNumber
  describe('isNumber', () => {
    it('should return true for numbers', () => {
      // A number should be recognized as a number
      expect(isNumber(42)).toBe(true);
    });

    it('should return false for numeric strings', () => {
      // A numeric string is not considered a number by this function
      expect(isNumber('42')).toBe(false);
    });
  });

  // Test for isDate
  describe('isDate', () => {
    it('should return true for Date objects', () => {
      // A valid Date object should return true
      expect(isDate(new Date())).toBe(true);
    });

    it('should return false for date strings', () => {
      // Date strings should not pass as Date objects
      expect(isDate('2020-01-01')).toBe(false);
    });
  });

  // Test for isArray
  describe('isArray', () => {
    it('should return true for arrays', () => {
      // An array should be detected as an array
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it('should return false for objects', () => {
      // An object is not considered an array
      expect(isArray({ length: 0 })).toBe(false);
    });
  });

  // Test for isError
  describe('isError', () => {
    it('should return true for Error instances', () => {
      // An instance of Error should return true
      expect(isError(new Error('error'))).toBe(true);
    });

    it('should return false for non-error objects', () => {
      // A plain object with an error-like shape is not sufficient
      expect(isError({ message: 'error' })).toBe(false);
    });
  });

  // Test for isUndefined
  describe('isUndefined', () => {
    it('should return true for undefined', () => {
      // undefined must be recognized correctly
      expect(isUndefined(undefined)).toBe(true);
    });

    it('should return false for defined values', () => {
      // Other values (null, 0) are not undefined
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
    });
  });

  // Test for isDefined
  describe('isDefined', () => {
    it('should return true for defined values', () => {
      // All values except undefined should be defined
      expect(isDefined(0)).toBe(true);
      expect(isDefined(null)).toBe(true);
      expect(isDefined('')).toBe(true);
    });

    it('should return false for undefined', () => {
      // undefined must return false for being defined
      expect(isDefined(undefined)).toBe(false);
    });
  });

  // Test for isNumeric
  describe('isNumeric', () => {
    it('should return true for numeric values and numeric strings', () => {
      expect(isNumeric(123)).toBe(true);
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('-123')).toBe(true);
    });

    it('should return false for non-numeric values', () => {
      expect(isNumeric('12.3')).toBe(false); // la regex n’autorise pas les décimales
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric(undefined)).toBe(false);
    });
  });

  // Test for isInteger
  describe('isInteger', () => {
    it('should return true for integer number values', () => {
      expect(isInteger(0)).toBe(true);
      expect(isInteger(42)).toBe(true);
      expect(isInteger(-7)).toBe(true);
    });

    it('should return false for non-integer values', () => {
      expect(isInteger(3.14)).toBe(false);
      expect(isInteger(NaN)).toBe(false);
      expect(isInteger(Infinity)).toBe(false);
    });

    it('should return false for numeric strings', () => {
      expect(isInteger('42')).toBe(false);
      expect(isInteger('-7')).toBe(false);
    });

    it('should return false for non-numeric types', () => {
      expect(isInteger('abc')).toBe(false);
      expect(isInteger(null)).toBe(false);
      expect(isInteger(undefined)).toBe(false);
    });
  });

  // Test for isFloat
  describe('isFloat', () => {
    it('should return true for finite non-integer numbers', () => {
      expect(isFloat(3.14)).toBe(true);
      expect(isFloat(-0.001)).toBe(true);
    });

    it('should return false for integer numbers', () => {
      expect(isFloat(0)).toBe(false);
      expect(isFloat(42)).toBe(false);
      expect(isFloat(-5)).toBe(false);
    });

    it('should return false for non-finite numbers', () => {
      expect(isFloat(NaN)).toBe(false);
      expect(isFloat(Infinity)).toBe(false);
      expect(isFloat(-Infinity)).toBe(false);
    });

    it('should return false for non-number types', () => {
      expect(isFloat('3.14')).toBe(false);
      expect(isFloat(null)).toBe(false);
      expect(isFloat(undefined)).toBe(false);
      expect(isFloat({})).toBe(false);
    });
  });

  // Test for isObject
  describe('isObject', () => {
    it('should return true for plain objects', () => {
      // A simple object should be considered an object
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('should return false for arrays, null, and non-objects', () => {
      // Arrays and null are not valid objects here
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(123)).toBe(false);
    });
  });

  // Test for isBoolean
  describe('isBoolean', () => {
    it('should return true for boolean values', () => {
      // True and false should both be recognized as boolean
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('should return false for non-boolean values', () => {
      // Non-boolean values should fail
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('false')).toBe(false);
    });
  });

  // Test for isEmpty
  describe('isEmpty', () => {
    it('should return true for undefined, null, empty string, and zero', () => {
      // Primitive empty values
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty(0)).toBe(true);
    });

    it('should return true for empty arrays', () => {
      // An array with no elements is considered empty
      expect(isEmpty([])).toBe(true);
    });

    it('should return true for objects without own properties', () => {
      // An empty object should be empty
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty arrays and objects', () => {
      // Arrays with content and objects with keys are not empty
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
    });

    it('should return false for Date objects', () => {
      // Even if a Date has no custom keys, it is not considered empty
      expect(isEmpty(new Date())).toBe(false);
    });
  });

  // Test for isMinimumLength
  describe('isMinimumLength', () => {
    it('should return true if string length is greater than or equal to the minimum', () => {
      // A string meeting the minimum length requirement should pass
      expect(isMinimumLength('hello', 3)).toBe(true);
    });

    it('should return false if string length is less than the minimum or if not a string', () => {
      // Too short strings or non-strings should fail
      expect(isMinimumLength('hi', 3)).toBe(false);
      expect(isMinimumLength(123, 3)).toBe(false);
    });
  });

  // Test for isEquals
  describe('isEquals', () => {
    it('should return true for deeply equal values', () => {
      // Primitive values and objects that are deeply equal should pass
      expect(isEquals(42, 42)).toBe(true);
      expect(isEquals({ a: 1 }, { a: 1 })).toBe(true);
    });

    it('should return false for non-equal values', () => {
      // Values that are different should fail
      expect(isEquals(42, '42')).toBe(false);
      expect(isEquals({ a: 1 }, { a: 2 })).toBe(false);
    });
  });

  // Test for isDifferent
  describe('isDifferent', () => {
    it('should return true for values that are not equal', () => {
      // Non-equal values should return true
      expect(isDifferent(42, '42')).toBe(true);
      expect(isDifferent({ a: 1 }, { a: 2 })).toBe(true);
    });

    it('should return false for equal values', () => {
      // Equal values should return false
      expect(isDifferent(42, 42)).toBe(false);
      expect(isDifferent({ a: 1 }, { a: 1 })).toBe(false);
    });
  });

  // Test for isDeepEqual
  describe('isDeepEqual', () => {
    it('should return true for equal primitive values', () => {
      // Equal numbers and strings should pass
      expect(isDeepEqual(1, 1)).toBe(true);
      expect(isDeepEqual('test', 'test')).toBe(true);
    });

    it('should return true for deeply equal arrays and objects', () => {
      // Arrays and objects with identical structure and values should pass
      expect(isDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isDeepEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
    });

    it('should return false for different structures or values', () => {
      // Mismatched arrays or objects should fail
      expect(isDeepEqual([1, 2, 3], [1, 2])).toBe(false);
      expect(isDeepEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should correctly compare Date objects', () => {
      // Date objects compared by their time value should behave accordingly
      const d1 = new Date('2020-01-01');
      const d2 = new Date('2020-01-01');
      const d3 = new Date('2021-01-01');
      expect(isDeepEqual(d1, d2)).toBe(true);
      expect(isDeepEqual(d1, d3)).toBe(false);
    });
  });

  // Test for isRegexp
  describe('isRegexp', () => {
    it('should return true for regular expression objects', () => {
      // A RegExp instance should return true
      expect(isRegexp(/abc/)).toBe(true);
    });

    it('should return false for non-RegExp values', () => {
      // Non-RegExp values like strings should fail
      expect(isRegexp('abc')).toBe(false);
    });
  });

  // Test for isEmail
  describe('isEmail', () => {
    it('should return true for valid email addresses', () => {
      // A proper email format should pass
      expect(isEmail('test@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses or non-string values', () => {
      // Incorrectly formatted emails or non-string types should fail
      expect(isEmail('not-an-email')).toBe(false);
      expect(isEmail(123)).toBe(false);
    });
  });

  // Test for isPhoneNumber
  describe('isPhoneNumber', () => {
    it('should return true for valid phone numbers', () => {
      // Phone numbers containing only spaces, parentheses, plus signs and digits are valid
      expect(isPhoneNumber('+1 (123) 4567890')).toBe(true);
    });

    it('should return false for invalid phone number strings', () => {
      // Phone numbers including letters should fail
      expect(isPhoneNumber('123-abc-7890')).toBe(false);
    });
  });

  // Test for isUuid
  describe('isUuid', () => {
    it('should return true for valid UUID strings', () => {
      // A UUID in proper format should pass
      expect(isUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('should return false for invalid UUID strings or non-string values', () => {
      // Incorrect UUID formats or non-string types should fail
      expect(isUuid('not-a-uuid')).toBe(false);
      expect(isUuid(123)).toBe(false);
    });
  });
});
