/* eslint-disable @typescript-eslint/no-explicit-any */
import { isDefined } from './is';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  TYPE DETECTION UTILITIES
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * Checks if T is exactly void (not a union with anything else).
 */
type IsExactlyVoid<T> = [T] extends [void] ? (void extends T ? true : false) : false;

/**
 * Checks if T is a pure value:
 * - not void
 * - not Promise
 * - not a union containing Promise
 */
type IsPureValue<T> =
  IsExactlyVoid<T> extends true
    ? false
    : T extends Promise<any>
      ? false
      : Extract<T, Promise<any>> extends never
        ? true
        : false;

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  KEY SELECTORS
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * Methods that are strictly synchronous and return void (not Promise).
 */
type TStrictVoidKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R ? (IsExactlyVoid<R> extends true ? K : never) : never;
}[keyof T];

/**
 * Methods that return Promise<void> or void | Promise<void> (but never just void).
 */
type TVoidPromiseKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R
    ? [Awaited<R>] extends [void]
      ? R extends void
        ? never
        : K
      : never
    : never;
}[keyof T];

/**
 * Methods that are synchronous and return a non-void value (no Promise, no union with Promise, no void).
 */
type TNonVoidSyncKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R ? (IsPureValue<R> extends true ? K : never) : never;
}[keyof T];

/**
 * Methods that are async (Promise<T>) or union X | Promise<X> where Awaited<T> is not void.
 */
type TNonVoidAsyncKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R
    ? Awaited<R> extends void
      ? never
      : R extends Promise<any>
        ? K
        : Extract<R, Promise<any>> extends never
          ? never
          : K
    : never;
}[keyof T];

/**
 * Extracts the function type of a method.
 */
type TExtractFunction<T, K extends keyof T> = T[K] extends (...args: any[]) => any ? T[K] : never;

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  OBSERVABLE
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  - dispatch           → strictly void callbacks
 *  - dispatchAsync      → Promise<void> or void | Promise<void>
 *  - askForResponse     → non-void synchronous return
 *  - askForResponseAsync→ non-void asynchronous return (Promise or union)
 */
export abstract class AbstractObservable<L> {
  /**
   * Listeners are stored in a Set to:
   * - avoid duplicates
   * - maintain insertion order
   */
  protected readonly listeners = new Set<Partial<L>>();

  /**
   * Add a listener.
   */
  public addListener(listener: Partial<L>): () => void {
    this.listeners.add(listener);
    return () => this.removeListener(listener);
  }

  /**
   * Remove a listener.
   */
  public removeListener(listener: Partial<L>): void {
    this.listeners.delete(listener);
  }

  // ───────────────────────── SYNC (void) ─────────────────────────

  /**
   * Notify each listener whose method strictly returns void.
   */
  public dispatch<K extends TStrictVoidKeys<L>>(method: K, ...args: Parameters<TExtractFunction<L, K>>): void {
    for (const listener of this.listeners) {
      const fn = listener[method];
      if (typeof fn !== 'function') continue;

      try {
        (fn as TExtractFunction<L, K>).apply(listener, args);
      } catch (err) {
        console.error(`Listener error in ${String(method)}:`, err);
      }
    }
  }

  /**
   * Call each synchronous listener (non-void return) until a truthy result is returned.
   */
  public askForResponse<K extends TNonVoidSyncKeys<L>, R = ReturnType<TExtractFunction<L, K>>>(
    method: K,
    ...args: Parameters<TExtractFunction<L, K>>
  ): R | undefined {
    for (const listener of this.listeners) {
      const fn = listener[method];
      if (typeof fn !== 'function') continue;

      try {
        const result = (fn as TExtractFunction<L, K>).apply(listener, args);
        if (isDefined(result) && result !== null) return result as R;
      } catch (err) {
        console.error(`Listener error in ${String(method)}:`, err);
      }
    }
    return undefined;
  }

  // ──────────────────────── ASYNC (void) ────────────────────────

  /**
   * Notify each listener whose method returns Promise<void> or void | Promise<void>.
   */
  public async dispatchAsync<K extends TVoidPromiseKeys<L>>(
    method: K,
    ...args: Parameters<TExtractFunction<L, K>>
  ): Promise<void> {
    for (const listener of this.listeners) {
      const fn = listener[method];
      if (typeof fn !== 'function') continue;

      try {
        await (fn as TExtractFunction<L, K>).apply(listener, args);
      } catch (err) {
        console.error(`Async listener error in ${String(method)}:`, err);
      }
    }
  }

  /**
   * Call each async or sync-async listener (non-void return) until a truthy result is resolved.
   */
  public async askForResponseAsync<K extends TNonVoidAsyncKeys<L>, R = Awaited<ReturnType<TExtractFunction<L, K>>>>(
    method: K,
    ...args: Parameters<TExtractFunction<L, K>>
  ): Promise<R | undefined> {
    for (const listener of this.listeners) {
      const fn = listener[method];
      if (typeof fn !== 'function') continue;

      try {
        const result = await (fn as TExtractFunction<L, K>).apply(listener, args);
        if (isDefined(result) && result !== null) return result as R;
      } catch (err) {
        console.error(`Async listener error in ${String(method)}:`, err);
      }
    }
    return undefined;
  }
}
