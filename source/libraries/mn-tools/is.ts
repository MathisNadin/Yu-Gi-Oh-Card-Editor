const NUMERIC_REGEXP = /^(?:-?(?:0|[1-9][0-9]*))$/;

const EMAIL_REGEXP =
  /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

const PHONE_NUMBER_REGEXP = /^[\s\(\)\+0-9]+$/i;

const UUID_REGEXP = /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function kind(variable: any): string {
  return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
}

/**
 * Check if the subject has keys
 *
 * @param {object} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasKeys(subject: any): boolean {
  for (let key in subject) if (subject.hasOwnProperty(key)) return true;
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringify(o: any) {
  return JSON.stringify(o);
}

/**
 * Check if the subject is a class
 *
 * @param {any} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isClass(func: any): boolean {
  return (
    hasKeys(func.prototype) || (typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func)))
  );
}

/**
 * Check if the subject is a function
 *
 * @param {any} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
export function isFunction(obj: any): obj is Function {
  return kind(obj) === 'function';
}

/**
 * Check if the subject is a string
 *
 * @param {any} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isString(obj: any): obj is string {
  return kind(obj) === 'string';
}

/**
 * Check if the subject is a number
 *
 * @param {any} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumber(obj: any): obj is number {
  return kind(obj) === 'number';
}

/**
 * Check if the subject is a date
 *
 * @param {any} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDate(obj: any): obj is Date {
  return kind(obj) === 'date';
}

/**
 * Check if the subject is an array
 *
 * @param {any} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isArray(obj: any): obj is any[] {
  return kind(obj) === 'array';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isError(obj: any): obj is Error {
  return obj instanceof Error;
}

/**
 * Check if subject is undefined (aka == undefined)
 *
 * @param {Object} subject subject to test.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUndefined(subject: any): subject is undefined {
  return typeof subject === 'undefined';
}

/**
 * Check if subject is defined (aka !== undefined)
 *
 * @param {Object} subject subject to test.
 */
export function isDefined<T>(subject: T | undefined): subject is T {
  return typeof subject !== 'undefined';
}

/**
 * Check if subject is numeric (even when it's a string).
 *
 * @param {Object} subject subject to test.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumeric(subject: any): subject is number {
  return NUMERIC_REGEXP.test(`${subject}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isInteger(subject: any): subject is number {
  return NUMERIC_REGEXP.test(`${subject}`);
}

/**
 * Check if subject is a well formed object
 *
 * @param {Object} subject subject to test.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
export function isObject(subject: any): subject is Object {
  return !isUndefined(subject) && !isArray(subject) && typeof subject === 'object';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isBoolean(subject: any): subject is boolean {
  return typeof subject === 'boolean';
}

/**
 * Check if subject is not empty (think php empty function)
 *
 * @param {Object} subject subject to test.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty(subject: any): boolean {
  return (
    isUndefined(subject) ||
    subject === null ||
    subject === 0 ||
    subject === '' ||
    (isArray(subject) && subject.length === 0) ||
    (!isDate(subject) && isObject(subject) && !hasKeys(subject))
  );
}

/**
 * Check the minimum length of the subject
 *
 * @param {string} subject the subject
 * @param {number} min the length to check
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMinimumLength(subject: any, min: number): boolean {
  return typeof subject === 'string' && subject.length >= min;
}

/**
 * Check if subject is equal to a value.
 *
 * @param {Object} subject subject to test.
 * @param {Object} value the value
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEquals(subject: any, value: any): boolean {
  return stringify(subject) === stringify(value);
}

/**
 * Check if the subject is differente that the reference
 *
 * @param {object} subject the subject
 * @param {object} reference the reference
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDifferent(subject: any, reference: any): boolean {
  return stringify(subject) !== stringify(reference);
}

/**
 * Check if the subject is a regexp
 *
 * @param {object} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isRegexp(subject: any): subject is RegExp {
  return subject instanceof RegExp;
}

/**
 * Check if the subject is a valid email address
 *
 * @param {string} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmail(subject: any): subject is string {
  return EMAIL_REGEXP.test(`${subject}`);
}

/**
 * Check if the subject is a valid phone number
 *
 * @param {object} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPhoneNumber(subject: any): subject is string {
  return PHONE_NUMBER_REGEXP.test(`${subject}`);
}

/**
 * Check if the subject is a valid UUID
 *
 * @param {object} subject the subject
 * @return {boolean} true if the test is successful
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUuid(subject: any): subject is string {
  return UUID_REGEXP.test(`${subject}`);
}
