import { isEmpty, isBoolean, isString } from './is';
import { each } from './objects';

export interface ICropBase64Options {
  /**
   * Source of the original image (base64 string or URL)
   */
  src: string;

  /**
   * X position of the crop area as a percentage of the total image width
   */
  x: number;

  /**
   * Y position of the crop area as a percentage of the total image height
   */
  y: number;

  /**
   * Width of the crop area as a percentage of the total image width
   */
  width: number;

  /**
   * Height of the crop area as a percentage of the total image height
   */
  height: number;

  /**
   * MIME type of the output image (e.g., 'image/jpeg', 'image/png')
   */
  mimeType?: string;
}

export async function getCroppedArtworkBase64(options: ICropBase64Options) {
  if (!options.src?.length) return '';

  const image = new Image();
  image.src = options.src;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = (err) => reject(err);
  });

  const canvas = document.createElement('canvas');
  canvas.width = (image.width * options.width) / 100;
  canvas.height = (image.height * options.height) / 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(
    image,
    (image.width * options.x) / 100,
    (image.height * options.y) / 100,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas.toDataURL(options.mimeType);
}

export function preloadImage(url: string) {
  if (!url) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Erreur de chargement de l'image : ${url}`));
  });
}

export function preloadVideo(url: string) {
  if (!url) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const video = document.createElement('video');
    video.src = url;

    // Attendre que la vidéo soit prête à être lue entièrement
    video.oncanplaythrough = () => resolve();
    video.onerror = () => reject(new Error(`Erreur de chargement de la vidéo : ${url}`));

    // Déclenche le chargement de la vidéo (sans lecture)
    video.load();
  });
}

/**
 * Convert a string version to its numeric version.
 *
 * @param {string} string string version Major.minor.build
 * @return {number} Numeric version Major*10000+minor*100+build
 */
export function toNumericVersion(string: string) {
  let tokens: number[] = string.split(/\./).map((x) => integer(x));
  return 1 * tokens[2] + tokens[1] * 100 + 10000 * tokens[0];
}

export function toStringVersion(value: number) {
  let major = Math.round(value / 10000);
  value %= 10000;
  let minor = Math.round(value / 100);
  value %= 100;
  return `${major}.${minor}.${value}`;
}

export function seq(count: number, from = 0, step = 1) {
  let result = [];
  for (let i = 0; i < count; i += step) {
    result.push(from + i);
  }
  return result;
}

/**
 * Convert any value to an integer.
 *
 * @param {any} x source value
 * @return {number} integer value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function integer(x: any) {
  return Math.round(float(x));
}

/**
 * Convert any value to a positive integer.
 *
 * @param {any} x source value
 * @return {number} integer value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function positiveInteger(x: any) {
  let ix = integer(x);
  return ix < 0 ? 0 : ix;
}

/**
 * Convert any value to an float.
 *
 * @param {any} x source value
 * @return {number} integer value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function float(x: any) {
  let sx = isEmpty(x) ? '0.0' : `${x}`;
  sx = sx.replace(/,/g, '.');
  let ix = parseFloat(sx);
  return Number.isNaN(ix) ? 0.0 : ix;
}

/**
 * Convert any value to a positive float.
 *
 * @param {any} x source value
 * @return {number} integer value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function positiveFloat(x: any) {
  let ix = float(x);
  return ix < 0 ? 0 : ix;
}

/**
 * Convert any value to an boolean.
 *
 * @param {any} x source value
 * @return {boolean} integer value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function boolean(x: any, d = false) {
  if (typeof x === 'undefined') return d;
  if (isBoolean(x)) return x;
  if (isString(x)) return x.toLowerCase() === 'true';
  return !!x;
}

export async function wait(ms: number) {
  return await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function debounce(func: Function, wait?: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timeout: any;
  // var count = 0;
  if (typeof wait === 'undefined') wait = 200;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any, ...args: any[]) {
    let later = () => {
      timeout = null;
      // if (count > 1) {
      // console.log('calling '+func.name+'() debounced '+count+' time(s)');
      // }
      // count = 0;
      func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait) as unknown as number;
    // count++;
  };
}

/**
 * Sort dependencies
 *
 * @param {any} x graph
 * @return {number} integer value
 */
export function sortDependencies(graph: { [name: string]: string[] }) {
  let sorted: string[] = [];
  let visited: { [name: string]: boolean } = {};

  each(graph, (_dependencies, name) => {
    visit(name);
  });

  function visit(name: string) {
    if (visited[name]) return;
    visited[name] = true;
    if (graph[name]) graph[name].forEach((dependency) => visit(dependency));
    sorted.push(name);
  }
  return sorted;
}

export function md5(string: string) {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function addUnsigned(lX: number, lY: number) {
    let lX4;
    let lY4;
    let lX8;
    let lY8;
    let lResult;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) {
      return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      } else {
        return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }

  function F(x: number, y: number, z: number) {
    return (x & y) | (~x & z);
  }
  function G(x: number, y: number, z: number) {
    return (x & z) | (y & ~z);
  }
  function H(x: number, y: number, z: number) {
    return x ^ y ^ z;
  }
  function I(x: number, y: number, z: number) {
    return y ^ (x | ~z);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(string: string) {
    let lWordCount;
    let lMessageLength = string.length;
    let lNumberOfWordsTemp1 = lMessageLength + 8;
    let lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    let lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    let lWordArray: number[] = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue: number) {
    let wordToHexValue = '';
    let wordToHexValueTemp = '';
    let lByte;
    let lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValueTemp = `0${lByte.toString(16)}`;
      wordToHexValue = wordToHexValue + wordToHexValueTemp.substring(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  }

  function utf8Encode(string: string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';

    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  let k;
  let AA;
  let BB;
  let CC;
  let DD;
  let xxa;
  let xxb;
  let xxc;
  let xxd;
  let S11 = 7;
  let S12 = 12;
  let S13 = 17;
  let S14 = 22;
  let S21 = 5;
  let S22 = 9;
  let S23 = 14;
  let S24 = 20;
  let S31 = 4;
  let S32 = 11;
  let S33 = 16;
  let S34 = 23;
  let S41 = 6;
  let S42 = 10;
  let S43 = 15;
  let S44 = 21;

  string = utf8Encode(string);

  let x = convertToWordArray(string);

  xxa = 0x67452301;
  xxb = 0xefcdab89;
  xxc = 0x98badcfe;
  xxd = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = xxa;
    BB = xxb;
    CC = xxc;
    DD = xxd;
    xxa = ff(xxa, xxb, xxc, xxd, x[k + 0], S11, 0xd76aa478);
    xxd = ff(xxd, xxa, xxb, xxc, x[k + 1], S12, 0xe8c7b756);
    xxc = ff(xxc, xxd, xxa, xxb, x[k + 2], S13, 0x242070db);
    xxb = ff(xxb, xxc, xxd, xxa, x[k + 3], S14, 0xc1bdceee);
    xxa = ff(xxa, xxb, xxc, xxd, x[k + 4], S11, 0xf57c0faf);
    xxd = ff(xxd, xxa, xxb, xxc, x[k + 5], S12, 0x4787c62a);
    xxc = ff(xxc, xxd, xxa, xxb, x[k + 6], S13, 0xa8304613);
    xxb = ff(xxb, xxc, xxd, xxa, x[k + 7], S14, 0xfd469501);
    xxa = ff(xxa, xxb, xxc, xxd, x[k + 8], S11, 0x698098d8);
    xxd = ff(xxd, xxa, xxb, xxc, x[k + 9], S12, 0x8b44f7af);
    xxc = ff(xxc, xxd, xxa, xxb, x[k + 10], S13, 0xffff5bb1);
    xxb = ff(xxb, xxc, xxd, xxa, x[k + 11], S14, 0x895cd7be);
    xxa = ff(xxa, xxb, xxc, xxd, x[k + 12], S11, 0x6b901122);
    xxd = ff(xxd, xxa, xxb, xxc, x[k + 13], S12, 0xfd987193);
    xxc = ff(xxc, xxd, xxa, xxb, x[k + 14], S13, 0xa679438e);
    xxb = ff(xxb, xxc, xxd, xxa, x[k + 15], S14, 0x49b40821);
    xxa = gg(xxa, xxb, xxc, xxd, x[k + 1], S21, 0xf61e2562);
    xxd = gg(xxd, xxa, xxb, xxc, x[k + 6], S22, 0xc040b340);
    xxc = gg(xxc, xxd, xxa, xxb, x[k + 11], S23, 0x265e5a51);
    xxb = gg(xxb, xxc, xxd, xxa, x[k + 0], S24, 0xe9b6c7aa);
    xxa = gg(xxa, xxb, xxc, xxd, x[k + 5], S21, 0xd62f105d);
    xxd = gg(xxd, xxa, xxb, xxc, x[k + 10], S22, 0x2441453);
    xxc = gg(xxc, xxd, xxa, xxb, x[k + 15], S23, 0xd8a1e681);
    xxb = gg(xxb, xxc, xxd, xxa, x[k + 4], S24, 0xe7d3fbc8);
    xxa = gg(xxa, xxb, xxc, xxd, x[k + 9], S21, 0x21e1cde6);
    xxd = gg(xxd, xxa, xxb, xxc, x[k + 14], S22, 0xc33707d6);
    xxc = gg(xxc, xxd, xxa, xxb, x[k + 3], S23, 0xf4d50d87);
    xxb = gg(xxb, xxc, xxd, xxa, x[k + 8], S24, 0x455a14ed);
    xxa = gg(xxa, xxb, xxc, xxd, x[k + 13], S21, 0xa9e3e905);
    xxd = gg(xxd, xxa, xxb, xxc, x[k + 2], S22, 0xfcefa3f8);
    xxc = gg(xxc, xxd, xxa, xxb, x[k + 7], S23, 0x676f02d9);
    xxb = gg(xxb, xxc, xxd, xxa, x[k + 12], S24, 0x8d2a4c8a);
    xxa = hh(xxa, xxb, xxc, xxd, x[k + 5], S31, 0xfffa3942);
    xxd = hh(xxd, xxa, xxb, xxc, x[k + 8], S32, 0x8771f681);
    xxc = hh(xxc, xxd, xxa, xxb, x[k + 11], S33, 0x6d9d6122);
    xxb = hh(xxb, xxc, xxd, xxa, x[k + 14], S34, 0xfde5380c);
    xxa = hh(xxa, xxb, xxc, xxd, x[k + 1], S31, 0xa4beea44);
    xxd = hh(xxd, xxa, xxb, xxc, x[k + 4], S32, 0x4bdecfa9);
    xxc = hh(xxc, xxd, xxa, xxb, x[k + 7], S33, 0xf6bb4b60);
    xxb = hh(xxb, xxc, xxd, xxa, x[k + 10], S34, 0xbebfbc70);
    xxa = hh(xxa, xxb, xxc, xxd, x[k + 13], S31, 0x289b7ec6);
    xxd = hh(xxd, xxa, xxb, xxc, x[k + 0], S32, 0xeaa127fa);
    xxc = hh(xxc, xxd, xxa, xxb, x[k + 3], S33, 0xd4ef3085);
    xxb = hh(xxb, xxc, xxd, xxa, x[k + 6], S34, 0x4881d05);
    xxa = hh(xxa, xxb, xxc, xxd, x[k + 9], S31, 0xd9d4d039);
    xxd = hh(xxd, xxa, xxb, xxc, x[k + 12], S32, 0xe6db99e5);
    xxc = hh(xxc, xxd, xxa, xxb, x[k + 15], S33, 0x1fa27cf8);
    xxb = hh(xxb, xxc, xxd, xxa, x[k + 2], S34, 0xc4ac5665);
    xxa = ii(xxa, xxb, xxc, xxd, x[k + 0], S41, 0xf4292244);
    xxd = ii(xxd, xxa, xxb, xxc, x[k + 7], S42, 0x432aff97);
    xxc = ii(xxc, xxd, xxa, xxb, x[k + 14], S43, 0xab9423a7);
    xxb = ii(xxb, xxc, xxd, xxa, x[k + 5], S44, 0xfc93a039);
    xxa = ii(xxa, xxb, xxc, xxd, x[k + 12], S41, 0x655b59c3);
    xxd = ii(xxd, xxa, xxb, xxc, x[k + 3], S42, 0x8f0ccc92);
    xxc = ii(xxc, xxd, xxa, xxb, x[k + 10], S43, 0xffeff47d);
    xxb = ii(xxb, xxc, xxd, xxa, x[k + 1], S44, 0x85845dd1);
    xxa = ii(xxa, xxb, xxc, xxd, x[k + 8], S41, 0x6fa87e4f);
    xxd = ii(xxd, xxa, xxb, xxc, x[k + 15], S42, 0xfe2ce6e0);
    xxc = ii(xxc, xxd, xxa, xxb, x[k + 6], S43, 0xa3014314);
    xxb = ii(xxb, xxc, xxd, xxa, x[k + 13], S44, 0x4e0811a1);
    xxa = ii(xxa, xxb, xxc, xxd, x[k + 4], S41, 0xf7537e82);
    xxd = ii(xxd, xxa, xxb, xxc, x[k + 11], S42, 0xbd3af235);
    xxc = ii(xxc, xxd, xxa, xxb, x[k + 2], S43, 0x2ad7d2bb);
    xxb = ii(xxb, xxc, xxd, xxa, x[k + 9], S44, 0xeb86d391);
    xxa = addUnsigned(xxa, AA);
    xxb = addUnsigned(xxb, BB);
    xxc = addUnsigned(xxc, CC);
    xxd = addUnsigned(xxd, DD);
  } // }}}

  let temp = wordToHex(xxa) + wordToHex(xxb) + wordToHex(xxc) + wordToHex(xxd);

  return temp.toLowerCase();
}

const t = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '0a',
  '0b',
  '0c',
  '0d',
  '0e',
  '0f',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '1a',
  '1b',
  '1c',
  '1d',
  '1e',
  '1f',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '2a',
  '2b',
  '2c',
  '2d',
  '2e',
  '2f',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '3a',
  '3b',
  '3c',
  '3d',
  '3e',
  '3f',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '4a',
  '4b',
  '4c',
  '4d',
  '4e',
  '4f',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '5a',
  '5b',
  '5c',
  '5d',
  '5e',
  '5f',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '6a',
  '6b',
  '6c',
  '6d',
  '6e',
  '6f',
  '70',
  '71',
  '72',
  '73',
  '74',
  '75',
  '76',
  '77',
  '78',
  '79',
  '7a',
  '7b',
  '7c',
  '7d',
  '7e',
  '7f',
  '80',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '8a',
  '8b',
  '8c',
  '8d',
  '8e',
  '8f',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
  '9a',
  '9b',
  '9c',
  '9d',
  '9e',
  '9f',
  'a0',
  'a1',
  'a2',
  'a3',
  'a4',
  'a5',
  'a6',
  'a7',
  'a8',
  'a9',
  'aa',
  'ab',
  'ac',
  'ad',
  'ae',
  'af',
  'b0',
  'b1',
  'b2',
  'b3',
  'b4',
  'b5',
  'b6',
  'b7',
  'b8',
  'b9',
  'ba',
  'bb',
  'bc',
  'bd',
  'be',
  'bf',
  'c0',
  'c1',
  'c2',
  'c3',
  'c4',
  'c5',
  'c6',
  'c7',
  'c8',
  'c9',
  'ca',
  'cb',
  'cc',
  'cd',
  'ce',
  'cf',
  'd0',
  'd1',
  'd2',
  'd3',
  'd4',
  'd5',
  'd6',
  'd7',
  'd8',
  'd9',
  'da',
  'db',
  'dc',
  'dd',
  'de',
  'df',
  'e0',
  'e1',
  'e2',
  'e3',
  'e4',
  'e5',
  'e6',
  'e7',
  'e8',
  'e9',
  'ea',
  'eb',
  'ec',
  'ed',
  'ee',
  'ef',
  'f0',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'fa',
  'fb',
  'fc',
  'fd',
  'fe',
  'ff',
];

export function uuid(): string {
  let A = Math.random() * 0xffffffff;
  let B = Math.random() * 0xffffffff;
  let C = Math.random() * 0xffffffff;
  let D = Math.random() * 0xffffffff;

  return `${t[A & 0xff] + t[(A >> 8) & 0xff] + t[(A >> 16) & 0xff] + t[(A >> 24) & 0xff]}-${t[B & 0xff]}${t[(B >> 8) & 0xff]}-${t[((B >> 16) & 0x0f) | 0x40]}${t[(B >> 24) & 0xff]}-${t[(C & 0x3f) | 0x80]}${t[(C >> 8) & 0xff]}-${t[(C >> 16) & 0xff]}${t[(C >> 24) & 0xff]}${t[D & 0xff]}${t[(D >> 8) & 0xff]}${t[(D >> 16) & 0xff]}${t[(D >> 24) & 0xff]}`;
}

export function smallUuid(length: number): string {
  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generate() {
    let ts = `${new Date().getTime()}`;
    let parts = ts.split('').reverse();
    let id = '';

    for (let i = 1; i <= length; i++) {
      let index = getRandomInt(0, parts.length - 1);
      id += parts[index];
      if (i % 3 === 0 && i !== length) id += '-';
    }

    return id;
  }

  return generate();
}

export function hslToRgb(hsl: [number, number, number]) {
  const [h, s, l] = hsl;

  // Convert HSL values to percentages
  const saturation = s / 100;
  const lightness = l / 100;

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation; // Chroma
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); // Second largest component
  const m = lightness - c / 2; // Match to 0-255 scale

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  // Convert RGB values to 0-255 scale and round
  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);

  return [red, green, blue];
}

export interface IParsedURI {
  source: string;
  protocol: string;
  authority: string;
  userInfo: string;
  user: string;
  password: string;
  host: string;
  port: string;
  relative: string;
  path: string;
  directory: string;
  file: string;
  query: string;
  anchor: string;
  parameters: { [key: string]: string };
}

/**
 * parser une URL.
 *
 * @param String uri l'uri à parser
 * @return Array un tableau contenant les éléments parsés
 */
type IParsedURIKeys = keyof IParsedURI;
export function parseUri(uri: string): IParsedURI {
  let keys: IParsedURIKeys[] = [
    'source',
    'protocol',
    'authority',
    'userInfo',
    'user',
    'password',
    'host',
    'port',
    'relative',
    'path',
    'directory',
    'file',
    'query',
    'anchor',
  ];
  let strictParser =
    /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
  let matches = strictParser.exec(uri);
  if (!matches) throw new Error('Unable to parse this url');
  let result: IParsedURI = {} as IParsedURI;

  for (let iKey = 14; iKey >= 0; iKey--) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result as any)[keys[iKey]] = matches[iKey] || '';
  }
  result.parameters = {};
  result.query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, (foo, key: string, value: string) => {
    if (key) result.parameters[key] = decodeURIComponent(value);
    return foo;
  });

  return result;
}

/**
 * Fontion permettant d'imploser une URI parsée.
 *
 * @param Array uri le tableau d'éléments (fourni par parseUri)
 * @return String l'url complète
 */
export function implodeUri(uri: IParsedURI) {
  let first = true;
  let result = '';
  if (uri.protocol !== '') {
    result += `${uri.protocol}://`;
  }
  if (uri.user !== '') {
    result += uri.user;
    if (uri.password !== '') {
      result += `:${uri.password}`;
    }
    result += '@';
  }
  result += uri.path;
  for (let queryKey in uri.parameters) {
    if (!first) {
      result += '&';
    } else {
      result += '?';
    }
    first = false;
    result += `${queryKey}=${uri.parameters[queryKey]}`;
  }
  return result;
}

export function queryGet(name: string, defaultValue: string) {
  name = name.replace(/[\[]/g, '[').replace(/[\]]/, ']');
  let regexS = `[\\?&]${name}=([^&#]*)`;
  let regex = new RegExp(regexS);
  let results = regex.exec(window.location.search);
  if (results === null) {
    return defaultValue;
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
}

interface ImageResizerOptions {
  data?: string;
  height?: number;
  width?: number;
  image: HTMLImageElement;
}

export function imageResizer(options: ImageResizerOptions, cb: (error: Error | undefined, data: string) => void) {
  let image: HTMLImageElement;

  if (options.data) {
    image = new Image();
    image.onload = onImageLoaded;
    image.src = options.data;
  } else if (options.image) {
    image = options.image;
    onImageLoaded();
  } else {
    throw new Error('We need image or data to resize !');
  }

  function onImageLoaded() {
    let canvas = document.createElement('canvas');
    if (!options.height && image.naturalWidth > image.naturalHeight) {
      if (options.width && image.naturalWidth > options.width) {
        canvas.width = options.width;
        canvas.height = (image.naturalHeight * options.width) / image.naturalWidth;
      }
    } else if (options.height && image.naturalHeight > options.height) {
      canvas.width = (image.naturalWidth * options.height) / image.naturalHeight;
      canvas.height = options.height;
    }
    let context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create 2D Context');
    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
    let data = canvas.toDataURL('image/jpeg', 0.7);
    cb(undefined, data);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function classNames(...args: any[]): string {
  const result = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'object' && !Array.isArray(arg)) {
      for (const k in arg) {
        if (!!arg[k]) result.push(k);
      }
    } else {
      result.push(arg);
    }
  }
  return result.join(' ');
}

export function dataFromDataUrl(dataUrl: string) {
  const ipos = dataUrl.indexOf(',');
  return dataUrl.substring(ipos + 1);
}

export function mimeTypeFromDataUrl(dataUrl: string) {
  const ipos = dataUrl.indexOf(',');
  return dataUrl.substring(5, ipos - 12);
}

const MIME_TO_EXT: { [mime: string]: string[] } = {
  'application/andrew-inset': ['ez'],
  'application/applixware': ['aw'],
  'application/atom+xml': ['atom'],
  'application/atomcat+xml': ['atomcat'],
  'application/atomdeleted+xml': ['atomdeleted'],
  'application/atomsvc+xml': ['atomsvc'],
  'application/atsc-dwd+xml': ['dwd'],
  'application/atsc-held+xml': ['held'],
  'application/atsc-rsat+xml': ['rsat'],
  'application/bdoc': ['bdoc'],
  'application/calendar+xml': ['xcs'],
  'application/ccxml+xml': ['ccxml'],
  'application/cdfx+xml': ['cdfx'],
  'application/cdmi-capability': ['cdmia'],
  'application/cdmi-container': ['cdmic'],
  'application/cdmi-domain': ['cdmid'],
  'application/cdmi-object': ['cdmio'],
  'application/cdmi-queue': ['cdmiq'],
  'application/cu-seeme': ['cu'],
  'application/dash+xml': ['mpd'],
  'application/davmount+xml': ['davmount'],
  'application/docbook+xml': ['dbk'],
  'application/dssc+der': ['dssc'],
  'application/dssc+xml': ['xdssc'],
  'application/ecmascript': ['ecma', 'es'],
  'application/emma+xml': ['emma'],
  'application/emotionml+xml': ['emotionml'],
  'application/epub+zip': ['epub'],
  'application/exi': ['exi'],
  'application/fdt+xml': ['fdt'],
  'application/font-tdpfr': ['pfr'],
  'application/geo+json': ['geojson'],
  'application/gml+xml': ['gml'],
  'application/gpx+xml': ['gpx'],
  'application/gxf': ['gxf'],
  'application/gzip': ['gz'],
  'application/hjson': ['hjson'],
  'application/hyperstudio': ['stk'],
  'application/inkml+xml': ['ink', 'inkml'],
  'application/ipfix': ['ipfix'],
  'application/its+xml': ['its'],
  'application/java-archive': ['jar', 'war', 'ear'],
  'application/java-serialized-object': ['ser'],
  'application/java-vm': ['class'],
  'application/javascript': ['js', 'mjs'],
  'application/json': ['json', 'map'],
  'application/json5': ['json5'],
  'application/jsonml+json': ['jsonml'],
  'application/ld+json': ['jsonld'],
  'application/lgr+xml': ['lgr'],
  'application/lost+xml': ['lostxml'],
  'application/mac-binhex40': ['hqx'],
  'application/mac-compactpro': ['cpt'],
  'application/mads+xml': ['mads'],
  'application/manifest+json': ['webmanifest'],
  'application/marc': ['mrc'],
  'application/marcxml+xml': ['mrcx'],
  'application/mathematica': ['ma', 'nb', 'mb'],
  'application/mathml+xml': ['mathml'],
  'application/mbox': ['mbox'],
  'application/mediaservercontrol+xml': ['mscml'],
  'application/metalink+xml': ['metalink'],
  'application/metalink4+xml': ['meta4'],
  'application/mets+xml': ['mets'],
  'application/mmt-aei+xml': ['maei'],
  'application/mmt-usd+xml': ['musd'],
  'application/mods+xml': ['mods'],
  'application/mp21': ['m21', 'mp21'],
  'application/mp4': ['mp4s', 'm4p'],
  'application/mrb-consumer+xml': ['*xdf'],
  'application/mrb-publish+xml': ['*xdf'],
  'application/msword': ['doc', 'dot'],
  'application/mxf': ['mxf'],
  'application/n-quads': ['nq'],
  'application/n-triples': ['nt'],
  'application/node': ['cjs'],
  'application/octet-stream': [
    'bin',
    'dms',
    'lrf',
    'mar',
    'so',
    'dist',
    'distz',
    'pkg',
    'bpk',
    'dump',
    'elc',
    'deploy',
    'exe',
    'dll',
    'deb',
    'dmg',
    'iso',
    'img',
    'msi',
    'msp',
    'msm',
    'buffer',
  ],
  'application/oda': ['oda'],
  'application/oebps-package+xml': ['opf'],
  'application/ogg': ['ogx'],
  'application/omdoc+xml': ['omdoc'],
  'application/onenote': ['onetoc', 'onetoc2', 'onetmp', 'onepkg'],
  'application/oxps': ['oxps'],
  'application/p2p-overlay+xml': ['relo'],
  'application/patch-ops-error+xml': ['*xer'],
  'application/pdf': ['pdf'],
  'application/pgp-encrypted': ['pgp'],
  'application/pgp-signature': ['asc', 'sig'],
  'application/pics-rules': ['prf'],
  'application/pkcs10': ['p10'],
  'application/pkcs7-mime': ['p7m', 'p7c'],
  'application/pkcs7-signature': ['p7s'],
  'application/pkcs8': ['p8'],
  'application/pkix-attr-cert': ['ac'],
  'application/pkix-cert': ['cer'],
  'application/pkix-crl': ['crl'],
  'application/pkix-pkipath': ['pkipath'],
  'application/pkixcmp': ['pki'],
  'application/pls+xml': ['pls'],
  'application/postscript': ['ai', 'eps', 'ps'],
  'application/provenance+xml': ['provx'],
  'application/pskc+xml': ['pskcxml'],
  'application/raml+yaml': ['raml'],
  'application/rdf+xml': ['rdf', 'owl'],
  'application/reginfo+xml': ['rif'],
  'application/relax-ng-compact-syntax': ['rnc'],
  'application/resource-lists+xml': ['rl'],
  'application/resource-lists-diff+xml': ['rld'],
  'application/rls-services+xml': ['rs'],
  'application/route-apd+xml': ['rapd'],
  'application/route-s-tsid+xml': ['sls'],
  'application/route-usd+xml': ['rusd'],
  'application/rpki-ghostbusters': ['gbr'],
  'application/rpki-manifest': ['mft'],
  'application/rpki-roa': ['roa'],
  'application/rsd+xml': ['rsd'],
  'application/rss+xml': ['rss'],
  'application/rtf': ['rtf'],
  'application/sbml+xml': ['sbml'],
  'application/scvp-cv-request': ['scq'],
  'application/scvp-cv-response': ['scs'],
  'application/scvp-vp-request': ['spq'],
  'application/scvp-vp-response': ['spp'],
  'application/sdp': ['sdp'],
  'application/senml+xml': ['senmlx'],
  'application/sensml+xml': ['sensmlx'],
  'application/set-payment-initiation': ['setpay'],
  'application/set-registration-initiation': ['setreg'],
  'application/shf+xml': ['shf'],
  'application/sieve': ['siv', 'sieve'],
  'application/smil+xml': ['smi', 'smil'],
  'application/sparql-query': ['rq'],
  'application/sparql-results+xml': ['srx'],
  'application/srgs': ['gram'],
  'application/srgs+xml': ['grxml'],
  'application/sru+xml': ['sru'],
  'application/ssdl+xml': ['ssdl'],
  'application/ssml+xml': ['ssml'],
  'application/swid+xml': ['swidtag'],
  'application/tei+xml': ['tei', 'teicorpus'],
  'application/thraud+xml': ['tfi'],
  'application/timestamped-data': ['tsd'],
  'application/toml': ['toml'],
  'application/ttml+xml': ['ttml'],
  'application/urc-ressheet+xml': ['rsheet'],
  'application/voicexml+xml': ['vxml'],
  'application/wasm': ['wasm'],
  'application/widget': ['wgt'],
  'application/winhlp': ['hlp'],
  'application/wsdl+xml': ['wsdl'],
  'application/wspolicy+xml': ['wspolicy'],
  'application/wps-office.doc': ['wps'],
  'application/wps-office.docx': ['wpt'],
  'application/wps-office.pdf': ['pdf'],
  'application/wps-office.xls': ['et'],
  'application/wps-office.xlsx': ['ett'],
  'application/wps-office.ppt': ['dps'],
  'application/wps-office.pptx': ['dpt'],
  'application/wps-office.template.doc': ['dot'],
  'application/wps-office.template.xls': ['xlt'],
  'application/wps-office.template.ppt': ['pot'],
  'application/wps-office.template.docx': ['dotx'],
  'application/wps-office.template.xlsx': ['xltx'],
  'application/wps-office.template.pptx': ['potx'],
  'application/xaml+xml': ['xaml'],
  'application/xcap-att+xml': ['xav'],
  'application/xcap-caps+xml': ['xca'],
  'application/xcap-diff+xml': ['xdf'],
  'application/xcap-el+xml': ['xel'],
  'application/xcap-error+xml': ['xer'],
  'application/xcap-ns+xml': ['xns'],
  'application/xenc+xml': ['xenc'],
  'application/xhtml+xml': ['xhtml', 'xht'],
  'application/xliff+xml': ['xlf'],
  'application/xml': ['xml', 'xsl', 'xsd', 'rng'],
  'application/xml-dtd': ['dtd'],
  'application/xop+xml': ['xop'],
  'application/xproc+xml': ['xpl'],
  'application/xslt+xml': ['xslt'],
  'application/xspf+xml': ['xspf'],
  'application/xv+xml': ['mxml', 'xhvml', 'xvml', 'xvm'],
  'application/yang': ['yang'],
  'application/yin+xml': ['yin'],
  'application/zip': ['zip'],
  'audio/3gpp': ['*3gpp'],
  'audio/adpcm': ['adp'],
  'audio/basic': ['au', 'snd'],
  'audio/midi': ['mid', 'midi', 'kar', 'rmi'],
  'audio/mobile-xmf': ['mxmf'],
  'audio/mp3': ['*mp3'],
  'audio/mp4': ['m4a', 'mp4a'],
  'audio/mpeg': ['mpga', 'mp2', 'mp2a', 'mp3', 'm2a', 'm3a'],
  'audio/ogg': ['oga', 'ogg', 'spx'],
  'audio/s3m': ['s3m'],
  'audio/silk': ['sil'],
  'audio/wav': ['wav'],
  'audio/wave': ['*wav'],
  'audio/webm': ['weba'],
  'audio/xm': ['xm'],
  'font/collection': ['ttc'],
  'font/otf': ['otf'],
  'font/ttf': ['ttf'],
  'font/woff': ['woff'],
  'font/woff2': ['woff2'],
  'image/aces': ['exr'],
  'image/apng': ['apng'],
  'image/bmp': ['bmp'],
  'image/cgm': ['cgm'],
  'image/dicom-rle': ['drle'],
  'image/emf': ['emf'],
  'image/fits': ['fits'],
  'image/g3fax': ['g3'],
  'image/gif': ['gif'],
  'image/heic': ['heic'],
  'image/heic-sequence': ['heics'],
  'image/heif': ['heif'],
  'image/heif-sequence': ['heifs'],
  'image/hej2k': ['hej2'],
  'image/hsj2': ['hsj2'],
  'image/ief': ['ief'],
  'image/jls': ['jls'],
  'image/jp2': ['jp2', 'jpg2'],
  'image/jpeg': ['jpeg', 'jpg', 'jpe'],
  'image/jph': ['jph'],
  'image/jphc': ['jhc'],
  'image/jpm': ['jpm'],
  'image/jpx': ['jpx', 'jpf'],
  'image/jxr': ['jxr'],
  'image/jxra': ['jxra'],
  'image/jxrs': ['jxrs'],
  'image/jxs': ['jxs'],
  'image/jxsc': ['jxsc'],
  'image/jxsi': ['jxsi'],
  'image/jxss': ['jxss'],
  'image/ktx': ['ktx'],
  'image/png': ['png'],
  'image/sgi': ['sgi'],
  'image/svg+xml': ['svg', 'svgz'],
  'image/t38': ['t38'],
  'image/tiff': ['tif', 'tiff'],
  'image/tiff-fx': ['tfx'],
  'image/webp': ['webp'],
  'image/wmf': ['wmf'],
  'message/disposition-notification': ['disposition-notification'],
  'message/global': ['u8msg'],
  'message/global-delivery-status': ['u8dsn'],
  'message/global-disposition-notification': ['u8mdn'],
  'message/global-headers': ['u8hdr'],
  'message/rfc822': ['eml', 'mime'],
  'model/3mf': ['3mf'],
  'model/gltf+json': ['gltf'],
  'model/gltf-binary': ['glb'],
  'model/iges': ['igs', 'iges'],
  'model/mesh': ['msh', 'mesh', 'silo'],
  'model/mtl': ['mtl'],
  'model/obj': ['obj'],
  'model/stl': ['stl'],
  'model/vrml': ['wrl', 'vrml'],
  'model/x3d+binary': ['*x3db', 'x3dbz'],
  'model/x3d+fastinfoset': ['x3db'],
  'model/x3d+vrml': ['*x3dv', 'x3dvz'],
  'model/x3d+xml': ['x3d', 'x3dz'],
  'model/x3d-vrml': ['x3dv'],
  'text/cache-manifest': ['appcache', 'manifest'],
  'text/calendar': ['ics', 'ifb'],
  'text/coffeescript': ['coffee', 'litcoffee'],
  'text/css': ['css'],
  'text/csv': ['csv'],
  'text/html': ['html', 'htm', 'shtml'],
  'text/jade': ['jade'],
  'text/jsx': ['jsx'],
  'text/less': ['less'],
  'text/markdown': ['markdown', 'md'],
  'text/mathml': ['mml'],
  'text/mdx': ['mdx'],
  'text/n3': ['n3'],
  'text/plain': ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
  'text/richtext': ['rtx'],
  'text/rtf': ['*rtf'],
  'text/sgml': ['sgml', 'sgm'],
  'text/shex': ['shex'],
  'text/slim': ['slim', 'slm'],
  'text/stylus': ['stylus', 'styl'],
  'text/tab-separated-values': ['tsv'],
  'text/troff': ['t', 'tr', 'roff', 'man', 'me', 'ms'],
  'text/turtle': ['ttl'],
  'text/uri-list': ['uri', 'uris', 'urls'],
  'text/vcard': ['vcard'],
  'text/vtt': ['vtt'],
  'text/xml': ['*xml'],
  'text/yaml': ['yaml', 'yml'],
  'video/3gpp': ['3gp', '3gpp'],
  'video/3gpp2': ['3g2'],
  'video/h261': ['h261'],
  'video/h263': ['h263'],
  'video/h264': ['h264'],
  'video/jpeg': ['jpgv'],
  'video/jpm': ['*jpm', 'jpgm'],
  'video/mj2': ['mj2', 'mjp2'],
  'video/mp2t': ['ts'],
  'video/mp4': ['mp4', 'mp4v', 'mpg4'],
  'video/mpeg': ['mpeg', 'mpg', 'mpe', 'm1v', 'm2v'],
  'video/ogg': ['ogv'],
  'video/quicktime': ['qt', 'mov'],
  'video/webm': ['webm'],
};

export function mimetype(filename: string) {
  const match = /\.(.+)$/.exec(filename);
  if (match) {
    for (const mime in MIME_TO_EXT) {
      if (MIME_TO_EXT[mime].includes(match[1])) return mime;
    }
  }
  return 'unknown';
}

export function mimetypeToExt(mimetype: string) {
  const exts = MIME_TO_EXT[mimetype];
  if (!exts.length) return '';
  return exts[0];
}
