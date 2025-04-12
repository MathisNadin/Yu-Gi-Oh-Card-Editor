import { expect } from '@jest/globals';

import {
  sanitizeFileName,
  toNumericVersion,
  toStringVersion,
  seq,
  integer,
  positiveInteger,
  float,
  positiveFloat,
  boolean,
  wait,
  debounce,
  sortDependencies,
  md5,
  uuid,
  smallUuid,
  hslToRgb,
  parseUri,
  implodeUri,
  classNames,
  dataFromDataUrl,
  mimeTypeFromDataUrl,
  mimetype,
  mimetypeToExt,
} from '../library/misc';

// ------------------------------------------------------------
// Define a custom Image constructor interface to avoid using any.
/* interface CustomImageConstructor {
  new (): HTMLImageElement;
  prototype: HTMLImageElement;
} */

// ------------------------------------------------------------
// getCroppedArtworkBase64 Tests
/* describe('getCroppedArtworkBase64', () => {
  const originalImage = window.Image;

  beforeAll(() => {
    // Override window.Image with a custom constructor.
    const fakeImage: CustomImageConstructor = function (): HTMLImageElement {
      const img = document.createElement('img') as HTMLImageElement;
      // Simulate default dimensions.
      Object.defineProperty(img, 'width', { value: 200, writable: true });
      Object.defineProperty(img, 'height', { value: 100, writable: true });
      setTimeout(() => {
        if (typeof img.onload === 'function') {
          img.onload(new Event('load'));
        }
      }, 0);
      return img;
    } as unknown as CustomImageConstructor;
    (window as unknown as { Image: CustomImageConstructor }).Image = fakeImage;
  });

  afterAll(() => {
    window.Image = originalImage;
  });

  it('should return a base64 string when image is loaded', async () => {
    const options = {
      src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD', // truncated dummy data
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      mimeType: 'image/jpeg',
    };
    const dataUrl = await getCroppedArtworkBase64(options);
    expect(isString(dataUrl)).toBe(true);
    expect(dataUrl.substring(0, 10)).toEqual('data:image');
  });

  it('should return empty string if src is empty', async () => {
    const options = {
      src: '',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    };
    const dataUrl = await getCroppedArtworkBase64(options);
    expect(dataUrl).toEqual('');
  });
}); */

// ------------------------------------------------------------
// preloadImage Tests
/* describe('preloadImage', () => {
  const originalImage = window.Image;

  beforeAll(() => {
    const fakeImage: CustomImageConstructor = function (): HTMLImageElement {
      const img = document.createElement('img') as HTMLImageElement;
      setTimeout(() => {
        if (typeof img.onload === 'function') {
          img.onload(new Event('load'));
        }
      }, 0);
      return img;
    } as unknown as CustomImageConstructor;
    (window as unknown as { Image: CustomImageConstructor }).Image = fakeImage;
  });

  afterAll(() => {
    window.Image = originalImage;
  });

  it('should resolve if image loads successfully', async () => {
    await expect(preloadImage('http://dummyurl/image.jpg')).resolves.toBeUndefined();
  });

  it('should reject if image fails to load', async () => {
    // Override Image temporarily to simulate error.
    const errorImage: CustomImageConstructor = function (): HTMLImageElement {
      const img = document.createElement('img') as HTMLImageElement;
      setTimeout(() => {
        if (typeof img.onerror === 'function') {
          img.onerror(new Event('error'));
        }
      }, 0);
      return img;
    } as unknown as CustomImageConstructor;
    (window as unknown as { Image: CustomImageConstructor }).Image = errorImage;
    await expect(preloadImage('http://dummyurl/fail.jpg')).rejects.toThrow();
    // Restore original Image.
    window.Image = originalImage;
  });
}); */

// ------------------------------------------------------------
// preloadVideo Tests
/* describe('preloadVideo', () => {
  const originalCreateElement = document.createElement.bind(document);

  it('should resolve if video is playable', async () => {
    document.createElement = ((tagName: string, options?: ElementCreationOptions): HTMLElement => {
      if (tagName.toLowerCase() === 'video') {
        // Convert result to unknown then HTMLVideoElement.
        const video = originalCreateElement(tagName, options) as unknown as HTMLVideoElement;
        video.load = () => {
          // simulation
        };
        setTimeout(() => {
          if (typeof video.oncanplaythrough === 'function') {
            video.oncanplaythrough(new Event('canplaythrough'));
          }
        }, 0);
        return video;
      }
      return originalCreateElement(tagName, options);
    }) as typeof document.createElement;

    await expect(preloadVideo('http://dummyurl/video.mp4')).resolves.toBeUndefined();
    // Restore original createElement.
    document.createElement = originalCreateElement;
  });

  it('should reject if video fails to load', async () => {
    document.createElement = ((tagName: string, options?: ElementCreationOptions): HTMLElement => {
      if (tagName.toLowerCase() === 'video') {
        const video = originalCreateElement(tagName, options) as unknown as HTMLVideoElement;
        video.load = () => {
          // simulation
        };
        setTimeout(() => {
          if (typeof video.onerror === 'function') {
            video.onerror(new Event('error'));
          }
        }, 0);
        return video;
      }
      return originalCreateElement(tagName, options);
    }) as typeof document.createElement;

    await expect(preloadVideo('http://dummyurl/fail.mp4')).rejects.toThrow();
    document.createElement = originalCreateElement;
  });
}); */

// ------------------------------------------------------------
// sanitizeFileName Tests
describe('sanitizeFileName', () => {
  it('should remove invalid characters and trim dots and spaces', () => {
    const input = '  .aux:file*name?.txt  ';
    const sanitized = sanitizeFileName(input);
    expect(sanitized).toBe('auxfilename.txt');
  });
  it('should return default name if result is empty', () => {
    const input = '<<<>>>';
    const sanitized = sanitizeFileName(input);
    expect(sanitized).toBe('unnamed_file');
  });
});

// ------------------------------------------------------------
// toNumericVersion & toStringVersion Tests
describe('version conversion', () => {
  it('toNumericVersion should convert version string to numeric version', () => {
    const numeric = toNumericVersion('1.2.3');
    expect(numeric).toBe(10203); // 1*10000 + 2*100 + 3
  });
  it('toStringVersion should convert numeric version back to string version', () => {
    const version = toStringVersion(10203);
    expect(version).toBe('1.2.3');
  });
});

// ------------------------------------------------------------
// seq Tests
describe('seq', () => {
  it('should generate a sequence with default step', () => {
    const result = seq(5, 0);
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });
  it('should generate a sequence with custom step', () => {
    const result = seq(5, 10, 2);
    expect(result).toEqual([10, 12, 14]);
  });
});

// ------------------------------------------------------------
// Number conversion functions Tests
describe('number conversion functions', () => {
  it('integer should round the number correctly', () => {
    expect(integer('3.7')).toBe(4);
  });
  it('positiveInteger should return 0 for negative inputs', () => {
    expect(positiveInteger('-10')).toBe(0);
  });
  it('float should convert comma decimals to float', () => {
    expect(float('1,5')).toBeCloseTo(1.5);
  });
  it('positiveFloat should return 0 for negative inputs', () => {
    expect(positiveFloat('-2.3')).toBe(0);
  });
});

// ------------------------------------------------------------
// boolean conversion Tests
describe('boolean conversion', () => {
  it('should convert string "true" to true', () => {
    expect(boolean('true')).toBe(true);
  });
  it('should convert other truthy values to boolean', () => {
    expect(boolean(1)).toBe(true);
  });
  it('should return default when value is undefined', () => {
    expect(boolean(undefined, false)).toBe(false);
  });
});

// ------------------------------------------------------------
// wait Tests
describe('wait', () => {
  it('should resolve after given milliseconds', async () => {
    const start = Date.now();
    await wait(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(50);
  });
});

// ------------------------------------------------------------
// debounce Tests
describe('debounce', () => {
  it('should debounce function calls', (done) => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };
    const debounced = debounce(fn, 30);
    debounced();
    debounced();
    debounced();
    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 50);
  });
});

// ------------------------------------------------------------
// sortDependencies Tests
describe('sortDependencies', () => {
  it('should sort dependencies in proper order', () => {
    const graph = {
      A: ['B', 'C'],
      B: ['C'],
      C: [],
    };
    const sorted = sortDependencies(graph);
    expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('B'));
    expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('A'));
  });
});

// ------------------------------------------------------------
// md5 Tests
describe('md5', () => {
  it('should return a 32-character hexadecimal string', () => {
    const hash = md5('test');
    expect(hash).toEqual(expect.stringMatching(/^[0-9a-f]{32}$/));
  });
});

// ------------------------------------------------------------
// uuid & smallUuid Tests
describe('uuid', () => {
  it('should return a valid uuid string', () => {
    const id = uuid();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });
});

describe('smallUuid', () => {
  it('should return a string with specified length (excluding dashes)', () => {
    const len = 8;
    const id = smallUuid(len);
    const plain = id.replace(/-/g, '');
    expect(plain.length).toBe(len);
  });
});

// ------------------------------------------------------------
// hslToRgb Tests
describe('hslToRgb', () => {
  it('should correctly convert HSL to RGB', () => {
    const rgb = hslToRgb([0, 100, 50]);
    expect(rgb).toEqual([255, 0, 0]); // Red
  });
});

// ------------------------------------------------------------
// parseUri & implodeUri Tests
describe('parseUri and implodeUri', () => {
  it('should parse a valid URI and reassemble it', () => {
    const uri = 'https://user:pass@example.com:8080/path/to/file?foo=bar#anchor';
    const parsed = parseUri(uri);
    expect(parsed.protocol).toBe('https');
    expect(parsed.user).toBe('user');
    const imploded = implodeUri(parsed);
    expect(imploded).toContain('/path/to/file');
    expect(imploded).toContain('?');
  });
  it('should throw an error for invalid URIs', () => {
    expect(() => parseUri('')).toThrow();
  });
});

// ------------------------------------------------------------
// queryGet Tests
/* describe('queryGet', () => {
  it('should return the query parameter value', () => {
    const originalSearch = window.location.search;
    Object.defineProperty(window, 'location', {
      value: {
        search: '?foo=bar&baz=qux',
      },
      writable: true,
    });
    expect(queryGet('foo', 'default')).toBe('bar');
    expect(queryGet('unknown', 'default')).toBe('default');
    Object.defineProperty(window, 'location', {
      value: { search: originalSearch },
      writable: true,
    });
  });
}); */

// ------------------------------------------------------------
// imageResizer Tests
/* describe('imageResizer', () => {
  let testImg: HTMLImageElement;
  beforeEach(() => {
    testImg = document.createElement('img');
    Object.defineProperty(testImg, 'naturalWidth', { value: 200, writable: true });
    Object.defineProperty(testImg, 'naturalHeight', { value: 100, writable: true });
    setTimeout(() => {
      if (typeof testImg.onload === 'function') testImg.onload(new Event('load'));
    }, 0);
  });
  it('should return a base64 string of resized image', (done) => {
    imageResizer({ image: testImg, width: 50, height: 50 }, (error, data) => {
      expect(error).toBeUndefined();
      expect(isString(data)).toBe(true);
      expect(data.substring(0, 10)).toEqual('data:image');
      done();
    });
  });
  it('should throw error if no image or data provided', () => {
    expect(() => imageResizer({} as unknown as Parameters<typeof imageResizer>[0], () => {})).toThrow();
  });
}); */

// ------------------------------------------------------------
// classNames Tests
describe('classNames', () => {
  it('should combine string arguments and object keys with truthy values', () => {
    const result = classNames('btn', { active: true, disabled: false }, 'primary');
    expect(result).toBe('btn active primary');
  });
});

// ------------------------------------------------------------
// dataFromDataUrl & mimeTypeFromDataUrl Tests
describe('dataFromDataUrl and mimeTypeFromDataUrl', () => {
  const dataUrl = 'data:image/png;base64,abcdefg';
  it('dataFromDataUrl should return data part', () => {
    expect(dataFromDataUrl(dataUrl)).toBe('abcdefg');
  });
  it('mimeTypeFromDataUrl should return the mime type', () => {
    expect(mimeTypeFromDataUrl(dataUrl)).toBe('image/png');
  });
});

// ------------------------------------------------------------
// mimetype & mimetypeToExt Tests
describe('mimetype and mimetypeToExt', () => {
  it('mimetype should return a valid mime type for known extensions', () => {
    const fileName = 'photo.jpg';
    const mime = mimetype(fileName);
    expect(mime).toBe('image/jpeg');
  });
  it('mimetypeToExt should return the first extension for a given mime type', () => {
    const ext = mimetypeToExt('application/json');
    expect(ext).toBe('json');
  });
});
