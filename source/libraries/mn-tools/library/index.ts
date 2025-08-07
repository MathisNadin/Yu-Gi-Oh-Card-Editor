export type TJSONValue = string | number | boolean | { [x: string]: TJSONValue } | TJSONValue[];

export interface JSONObject {
  [x: string]: TJSONValue;
}

export interface JSONArray extends Array<TJSONValue> {}

export async function sleep(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time);
  });
}

export function plural(count: number, none: string, single: string, multiple: string) {
  if (!count) return none;
  return (count === 1 ? single : multiple).replace('%%', count.toString());
}

export function formatList(a: string[]) {
  if (a.length === 1) return a[0];
  let last = a.pop();
  return `${a.join(', ')} et ${last}`;
}

export * from './emojies';
export * from './patch';
export * from './is';
export * from './objects';
export * from './misc';
export * from './date';
export * from './ansi';
export * from './logger';
export * from './locales';
export * from './AbstractObservable';
