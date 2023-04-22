/* eslint-disable lines-between-class-members */
/* eslint-disable prettier/prettier */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

export class ErrorManagerService {
  public handlePromise(result: Promise<any> | any) {
    // eslint-disable-next-line no-console
    if (result instanceof Promise) result.catch((e: Error) => console.error(e));
  }
}
