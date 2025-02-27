export interface ICookieOptions {
  expires?: Date; // Expiration date as Date object or string
  path?: string; // The path where the cookie is accessible
  domain?: string; // The domain where the cookie is accessible
  secure?: boolean; // Whether the cookie should be transmitted only over secure protocols like HTTPS
  sameSite?: 'Strict' | 'Lax' | 'None'; // SameSite attribute to control cross-site request behavior
}

export class CookieService {
  /**
   * Sets a cookie with the specified name, value, and options.
   * If the cookie already exists, it will be overwritten.
   * @param name - The name of the cookie.
   * @param value - The value of the cookie.
   * @param options - Additional cookie options.
   */
  public set(name: TApplicationCookie, value: string, options: ICookieOptions = {}) {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Handle expiration option
    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    // Handle path option
    if (options.path) {
      cookieString += `; path=${options.path}`;
    } else {
      cookieString += `; path=/`;
    }

    // Handle domain option
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    // Handle secure option
    if (options.secure) {
      cookieString += `; Secure`;
    }

    // Handle SameSite option
    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Retrieves the value of a cookie with the specified name.
   * Returns undefined if the cookie is not found.
   * @param name - The name of the cookie.
   * @returns The value of the cookie or undefined if not found.
   */
  public get(name: TApplicationCookie): string | undefined; // Case when `defaultValue` is undefined
  public get(name: TApplicationCookie, defaultValue: string): string; // Case when `defaultValue` is defined
  public get(name: TApplicationCookie, defaultValue?: string) {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      // Trim leading spaces
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return defaultValue;
  }

  /**
   * Deletes a cookie by setting its expiration date in the past.
   * Additional options can be specified to match the cookie to be deleted (e.g., path, domain).
   * @param name - The name of the cookie to delete.
   * @param options - Options such as path or domain to correctly identify the cookie.
   */
  public delete(name: TApplicationCookie, options: ICookieOptions = {}) {
    // Set the cookie with an expiration date in the past to delete it
    this.set(name, '', {
      ...options,
      expires: new Date(0),
    });
  }
}
