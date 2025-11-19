const NUMERIC_REGEXP = /^(?:-?(?:0|[1-9][0-9]*))$/;

const EMAIL_REGEXP =
  /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

const PHONE_NUMBER_REGEXP = /^[\s\(\)\+0-9]+$/i;

const UUID_REGEXP = /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i;

/**
 * Check if the subject has keys.
 *
 * @param subject - The subject to test.
 * @return True if the object has at least one own property.
 */
export function hasKeys(subject: Record<string, unknown>): boolean {
  for (const key in subject) {
    if (Object.prototype.hasOwnProperty.call(subject, key)) return true;
  }
  return false;
}

/**
 * Stringify an object.
 *
 * @param o - The object to stringify.
 */
function stringify(o: unknown): string {
  return JSON.stringify(o);
}

/**
 * Check if the subject is a class.
 *
 * @param subject - The subject to test.
 * @return True if the subject is a class.
 */
export function isClass(subject: unknown): boolean {
  if (typeof subject !== 'function') return false;

  const str = Function.prototype.toString.call(subject);

  // 1. Native ES6 class
  if (/^class\s/.test(str)) return true;

  // 2. TypeScript/Babel-transpiled class
  // → constructor has a `_classCallCheck`
  if (/^function\s[A-Z]/.test(str)) return true;

  return false;
}

/**
 * Check if the subject is a function.
 *
 * @param subject - The subject to test.
 * @return True if the subject is a function.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction(subject: unknown): subject is Function {
  return typeof subject === 'function';
}

/**
 * Check if the subject is a string.
 *
 * @param subject - The subject to test.
 * @return True if the subject is a string.
 */
export function isString(subject: unknown): subject is string {
  return typeof subject === 'string';
}

/**
 * Check if the subject is a number.
 *
 * @param subject - The subject to test.
 * @return True if the subject is a number.
 */
export function isNumber(subject: unknown): subject is number {
  return typeof subject === 'number';
}

/**
 * Check if the subject is a date.
 *
 * @param subject - The subject to test.
 * @return True if the subject is a date.
 */
export function isDate(subject: unknown): subject is Date {
  return subject instanceof Date;
}

/**
 * Check if the subject is an array.
 *
 * @param subject - The subject to test.
 * @return True if the subject is an array.
 */
export function isArray(subject: unknown): subject is unknown[] {
  return Array.isArray(subject);
}

/**
 * Check if the subject is an error.
 *
 * @param subject - The subject to test.
 * @return True if the subject is an instance of Error.
 */
export function isError(subject: unknown): subject is Error {
  return subject instanceof Error;
}

/**
 * Check if the subject is undefined.
 *
 * @param subject - The subject to test.
 */
export function isUndefined(subject: unknown): subject is undefined {
  return typeof subject === 'undefined';
}

/**
 * Check if the subject is defined (i.e. not undefined).
 *
 * @param subject - The subject to test.
 */
export function isDefined<T>(subject: T | undefined): subject is T {
  return typeof subject !== 'undefined';
}

/**
 * Check if the subject is numeric (even when it's a string).
 *
 * @param subject - The subject to test.
 */
export function isNumeric(subject: unknown): boolean {
  return NUMERIC_REGEXP.test(String(subject));
}

/**
 * Check if the subject is an integer number.
 *
 * @param subject - The subject to test.
 * @return True if the subject is a number and an integer.
 */
export function isInteger(subject: unknown): subject is number {
  return typeof subject === 'number' && Number.isInteger(subject);
}

/**
 * Check if the subject is a float (nombre à virgule).
 *
 * @param subject - The subject to test.
 * @return True if the subject is a number, fini, et non entier.
 */
export function isFloat(subject: unknown): subject is number {
  return typeof subject === 'number' && Number.isFinite(subject) && !Number.isInteger(subject);
}

/**
 * Check if the subject is a well-formed object.
 *
 * @param subject - The subject to test.
 */
export function isObject(subject: unknown): subject is object {
  return subject !== null && !isUndefined(subject) && !isArray(subject) && typeof subject === 'object';
}

/**
 * Check if the subject is a boolean.
 *
 * @param subject - The subject to test.
 */
export function isBoolean(subject: unknown): subject is boolean {
  return typeof subject === 'boolean';
}

type TEmptyPrimitives = undefined | null | '' | 0;

/**
 * Check if the subject is empty (similar to PHP's empty function).
 *
 * @param subject - The subject to test.
 */
export function isEmpty<T>(subject: T): subject is Extract<T, TEmptyPrimitives> {
  return (
    isUndefined(subject) ||
    subject === null ||
    subject === 0 ||
    subject === '' ||
    (isArray(subject) && subject.length === 0) ||
    (!isDate(subject) && isObject(subject) && !hasKeys(subject as Record<string, unknown>))
  );
}

/**
 * Check the minimum length of the subject.
 *
 * @param subject - The subject to test.
 * @param min - The minimum length.
 * @return True if the subject is a string with a length >= min.
 */
export function isMinimumLength(subject: unknown, min: number): subject is string {
  return isString(subject) && subject.length >= min;
}

/**
 * Check if the subject is equal to a value.
 *
 * @param subject - The subject to test.
 * @param value - The value to compare.
 * @return True if the subject is equal to the value.
 */
export function isEquals(subject: unknown, value: unknown): boolean {
  return stringify(subject) === stringify(value);
}

/**
 * Check if the subject is different from the reference.
 *
 * @param subject - The subject to test.
 * @param reference - The reference value.
 * @return True if the subject is different from the reference.
 */
export function isDifferent(subject: unknown, reference: unknown): boolean {
  return stringify(subject) !== stringify(reference);
}

/**
 * Check if the subject is deeply equal to another object.
 *
 * @param obj1 - The first object.
 * @param obj2 - The second object.
 * @return True if the objects are deeply equal.
 */
export function isDeepEqual(obj1: unknown, obj2: unknown): boolean {
  if (isUndefined(obj1) || isUndefined(obj2)) return obj1 === obj2;
  if (obj1 === null || obj2 === null) return obj1 === obj2;

  if (typeof obj1 !== typeof obj2) return false; // Early exit if types differ

  // Handling Dates specifically
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  // Handle Arrays
  if (isArray(obj1) && isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!isDeepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // Handle objects and any potential deep nesting
  if (isObject(obj1) && isObject(obj2)) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!isDeepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) return false;
    }
    return true;
  }

  // Default to strict equality check for primitives
  return obj1 === obj2;
}

/**
 * Check if the subject is a regular expression.
 *
 * @param subject - The subject to test.
 */
export function isRegexp(subject: unknown): subject is RegExp {
  return subject instanceof RegExp;
}

/**
 * Check if the subject is a valid email address.
 *
 * @param subject - The subject to test.
 */
export function isEmail(subject: unknown): subject is string {
  return isString(subject) && EMAIL_REGEXP.test(subject);
}

/**
 * Check if the subject is a valid phone number.
 *
 * @param subject - The subject to test.
 */
export function isPhoneNumber(subject: unknown): subject is string {
  return isString(subject) && PHONE_NUMBER_REGEXP.test(subject);
}

/**
 * Check if the subject is a valid UUID.
 *
 * @param subject - The subject to test.
 */
export function isUuid(subject: unknown): subject is string {
  return isString(subject) && UUID_REGEXP.test(subject);
}
