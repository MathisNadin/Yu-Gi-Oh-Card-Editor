/* eslint-disable import/prefer-default-export */
export function handlePromise(result: Promise<any> | any) {
  // eslint-disable-next-line no-console
  if (result instanceof Promise) result.catch((e: Error) => console.error(e));
}
