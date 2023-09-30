import { Crop } from "react-image-crop";
import { isEmpty, isBoolean, isString, isObject } from "./is";
import { each } from "./objects";

export async function getCroppedArtworkBase64(src: string, crop: Crop) {
  if (!src?.length) return '';
  const image = new Image();
  image.src = src;
  await new Promise<void>(resolve => {
    image.onload = () => {
      resolve();
    };
  });
  const canvas = document.createElement('canvas');
  canvas.width = image.width * crop.width / 100;
  canvas.height = image.height * crop.height / 100;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(
    image,
    image.width * crop.x / 100,
    image.height * crop.y / 100,
    canvas.width, canvas.height,
    0, 0, canvas.width, canvas.height
  );
  return canvas.toDataURL();
}


/**
 * Convert a string version to its numeric version.
 *
 * @param {string} string string version Major.minor.build
 * @return {number} Numeric version Major*10000+minor*100+build
 */
export function toNumericVersion(string: string) {
  let tokens: number[] = string.split(/\./).map(x => integer(x));
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
export function integer(x: any) {
  return Math.round(float(x));
}


/**
 * Convert any value to a positive integer.
 *
 * @param {any} x source value
 * @return {number} integer value
 */
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
export function boolean(x: any, d = false) {
  if (typeof x === 'undefined') return d;
  if (isBoolean(x)) return x;
  if (isString(x)) return x.toLowerCase() === 'true';
  return !!x;
}





export function debounce(func: Function, wait?: number) {
  let timeout: any;
  // var count = 0;
  if (typeof wait === 'undefined') wait = 200;
  return function(this: any, ...args: any[]) {
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
export function sortDependencies(graph: {[name: string]: string[]}) {
  let sorted: string[] = [];
  let visited: {[name: string]: boolean} = {};

  each(graph, (_dependencies, name) => {
    visit(name);
  });

  function visit(name: string) {
    if (visited[name]) return;
    visited[name] = true;
    if (graph[name]) graph[name].forEach(dependency => visit(dependency));
    sorted.push(name);
  }
  return sorted;
}



export function md5(string: string) {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function addUnsigned(lX: number, lY: number) {
    let lX4; let lY4; let lX8; let lY8; let lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function F(x: number, y: number, z: number) {return (x & y) | ((~x) & z);}
  function G(x: number, y: number, z: number) {return (x & z) | (y & (~z));}
  function H(x: number, y: number, z: number) {return (x ^ y ^ z);}
  function I(x: number, y: number, z: number) {return (y ^ (x | (~z)));}

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
    let lWordArray : number[] = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
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
    let wordToHexValue = ""; let wordToHexValueTemp = ""; let lByte; let lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValueTemp = `0${  lByte.toString(16)}`;
      wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  }

  function utf8Encode(string: string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";

    for (let n = 0; n < string.length; n++) {

      let c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
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

  let k; let AA; let BB; let CC; let DD; let xxa; let xxb; let xxc; let xxd;
  let S11 = 7; let S12 = 12; let S13 = 17; let S14 = 22;
  let S21 = 5; let S22 = 9; let S23 = 14; let S24 = 20;
  let S31 = 4; let S32 = 11; let S33 = 16; let S34 = 23;
  let S41 = 6; let S42 = 10; let S43 = 15; let S44 = 21;

  string = utf8Encode(string);

  let x = convertToWordArray(string);

  xxa = 0x67452301; xxb = 0xEFCDAB89; xxc = 0x98BADCFE; xxd = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = xxa; BB = xxb; CC = xxc; DD = xxd;
    xxa = ff(xxa, xxb, xxc, xxd, x[k + 0], S11, 0xD76AA478);
    xxd = ff(xxd, xxa, xxb, xxc, x[k + 1], S12, 0xE8C7B756);
    xxc = ff(xxc, xxd, xxa, xxb, x[k + 2], S13, 0x242070DB);
    xxb = ff(xxb, xxc, xxd, xxa, x[k + 3], S14, 0xC1BDCEEE);
    xxa = ff(xxa, xxb, xxc, xxd, x[k + 4], S11, 0xF57C0FAF);
    xxd = ff(xxd, xxa, xxb, xxc, x[k + 5], S12, 0x4787C62A);
    xxc = ff(xxc, xxd, xxa, xxb, x[k + 6], S13, 0xA8304613);
    xxb = ff(xxb, xxc, xxd, xxa, x[k + 7], S14, 0xFD469501);
    xxa = ff(xxa, xxb, xxc, xxd, x[k + 8], S11, 0x698098D8);
    xxd = ff(xxd, xxa, xxb, xxc, x[k + 9], S12, 0x8B44F7AF);
    xxc = ff(xxc, xxd, xxa, xxb, x[k + 10], S13, 0xFFFF5BB1);
    xxb = ff(xxb, xxc, xxd, xxa, x[k + 11], S14, 0x895CD7BE);
    xxa = ff(xxa, xxb, xxc, xxd, x[k + 12], S11, 0x6B901122);
    xxd = ff(xxd, xxa, xxb, xxc, x[k + 13], S12, 0xFD987193);
    xxc = ff(xxc, xxd, xxa, xxb, x[k + 14], S13, 0xA679438E);
    xxb = ff(xxb, xxc, xxd, xxa, x[k + 15], S14, 0x49B40821);
    xxa = gg(xxa, xxb, xxc, xxd, x[k + 1], S21, 0xF61E2562);
    xxd = gg(xxd, xxa, xxb, xxc, x[k + 6], S22, 0xC040B340);
    xxc = gg(xxc, xxd, xxa, xxb, x[k + 11], S23, 0x265E5A51);
    xxb = gg(xxb, xxc, xxd, xxa, x[k + 0], S24, 0xE9B6C7AA);
    xxa = gg(xxa, xxb, xxc, xxd, x[k + 5], S21, 0xD62F105D);
    xxd = gg(xxd, xxa, xxb, xxc, x[k + 10], S22, 0x2441453);
    xxc = gg(xxc, xxd, xxa, xxb, x[k + 15], S23, 0xD8A1E681);
    xxb = gg(xxb, xxc, xxd, xxa, x[k + 4], S24, 0xE7D3FBC8);
    xxa = gg(xxa, xxb, xxc, xxd, x[k + 9], S21, 0x21E1CDE6);
    xxd = gg(xxd, xxa, xxb, xxc, x[k + 14], S22, 0xC33707D6);
    xxc = gg(xxc, xxd, xxa, xxb, x[k + 3], S23, 0xF4D50D87);
    xxb = gg(xxb, xxc, xxd, xxa, x[k + 8], S24, 0x455A14ED);
    xxa = gg(xxa, xxb, xxc, xxd, x[k + 13], S21, 0xA9E3E905);
    xxd = gg(xxd, xxa, xxb, xxc, x[k + 2], S22, 0xFCEFA3F8);
    xxc = gg(xxc, xxd, xxa, xxb, x[k + 7], S23, 0x676F02D9);
    xxb = gg(xxb, xxc, xxd, xxa, x[k + 12], S24, 0x8D2A4C8A);
    xxa = hh(xxa, xxb, xxc, xxd, x[k + 5], S31, 0xFFFA3942);
    xxd = hh(xxd, xxa, xxb, xxc, x[k + 8], S32, 0x8771F681);
    xxc = hh(xxc, xxd, xxa, xxb, x[k + 11], S33, 0x6D9D6122);
    xxb = hh(xxb, xxc, xxd, xxa, x[k + 14], S34, 0xFDE5380C);
    xxa = hh(xxa, xxb, xxc, xxd, x[k + 1], S31, 0xA4BEEA44);
    xxd = hh(xxd, xxa, xxb, xxc, x[k + 4], S32, 0x4BDECFA9);
    xxc = hh(xxc, xxd, xxa, xxb, x[k + 7], S33, 0xF6BB4B60);
    xxb = hh(xxb, xxc, xxd, xxa, x[k + 10], S34, 0xBEBFBC70);
    xxa = hh(xxa, xxb, xxc, xxd, x[k + 13], S31, 0x289B7EC6);
    xxd = hh(xxd, xxa, xxb, xxc, x[k + 0], S32, 0xEAA127FA);
    xxc = hh(xxc, xxd, xxa, xxb, x[k + 3], S33, 0xD4EF3085);
    xxb = hh(xxb, xxc, xxd, xxa, x[k + 6], S34, 0x4881D05);
    xxa = hh(xxa, xxb, xxc, xxd, x[k + 9], S31, 0xD9D4D039);
    xxd = hh(xxd, xxa, xxb, xxc, x[k + 12], S32, 0xE6DB99E5);
    xxc = hh(xxc, xxd, xxa, xxb, x[k + 15], S33, 0x1FA27CF8);
    xxb = hh(xxb, xxc, xxd, xxa, x[k + 2], S34, 0xC4AC5665);
    xxa = ii(xxa, xxb, xxc, xxd, x[k + 0], S41, 0xF4292244);
    xxd = ii(xxd, xxa, xxb, xxc, x[k + 7], S42, 0x432AFF97);
    xxc = ii(xxc, xxd, xxa, xxb, x[k + 14], S43, 0xAB9423A7);
    xxb = ii(xxb, xxc, xxd, xxa, x[k + 5], S44, 0xFC93A039);
    xxa = ii(xxa, xxb, xxc, xxd, x[k + 12], S41, 0x655B59C3);
    xxd = ii(xxd, xxa, xxb, xxc, x[k + 3], S42, 0x8F0CCC92);
    xxc = ii(xxc, xxd, xxa, xxb, x[k + 10], S43, 0xFFEFF47D);
    xxb = ii(xxb, xxc, xxd, xxa, x[k + 1], S44, 0x85845DD1);
    xxa = ii(xxa, xxb, xxc, xxd, x[k + 8], S41, 0x6FA87E4F);
    xxd = ii(xxd, xxa, xxb, xxc, x[k + 15], S42, 0xFE2CE6E0);
    xxc = ii(xxc, xxd, xxa, xxb, x[k + 6], S43, 0xA3014314);
    xxb = ii(xxb, xxc, xxd, xxa, x[k + 13], S44, 0x4E0811A1);
    xxa = ii(xxa, xxb, xxc, xxd, x[k + 4], S41, 0xF7537E82);
    xxd = ii(xxd, xxa, xxb, xxc, x[k + 11], S42, 0xBD3AF235);
    xxc = ii(xxc, xxd, xxa, xxb, x[k + 2], S43, 0x2AD7D2BB);
    xxb = ii(xxb, xxc, xxd, xxa, x[k + 9], S44, 0xEB86D391);
    xxa = addUnsigned(xxa, AA);
    xxb = addUnsigned(xxb, BB);
    xxc = addUnsigned(xxc, CC);
    xxd = addUnsigned(xxd, DD);
  } // }}}

  let temp = wordToHex(xxa) + wordToHex(xxb) + wordToHex(xxc) + wordToHex(xxd);

  return temp.toLowerCase();
}

const t =
  ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c',
    '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26',
    '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33',
    '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40',
    '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d',
    '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a',
    '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67',
    '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74',
    '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81',
    '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e',
    '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b',
    '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8',
    'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5',
    'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2',
    'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf',
    'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc',
    'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9',
    'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6',
    'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff'];

export function uuid(): string {
  let A = Math.random() * 0xffffffff;
  let B = Math.random() * 0xffffffff;
  let C = Math.random() * 0xffffffff;
  let D = Math.random() * 0xffffffff;

  return `${t[A & 0xff] + t[A >> 8 & 0xff] + t[A >> 16 & 0xff] + t[A >> 24 & 0xff]  }-${

    t[B & 0xff]  }${t[B >> 8 & 0xff]  }-${

    t[B >> 16 & 0x0f | 0x40]  }${t[B >> 24 & 0xff]  }-${

    t[C & 0x3f | 0x80]  }${t[C >> 8 & 0xff]  }-${

    t[C >> 16 & 0xff]  }${t[C >> 24 & 0xff]  }${t[D & 0xff]  }${t[D >> 8 & 0xff]  }${t[D >> 16 & 0xff]  }${t[D >> 24 & 0xff]}`;
}

export function smallUuid(length: number): string {


  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generate() {
    let ts = `${new Date().getTime()}`;
    let parts = ts.split("").reverse();
    let id = "";

    for (let i = 1; i <= length; i++) {
      let index = getRandomInt(0, parts.length - 1);
      id += parts[index];
      if (i % 3 === 0 && i !== length) id += '-';
    }

    return id;
  }

  return generate();
}


export interface IParsedURI {
  source: string,
  protocol: string,
  authority: string,
  userInfo: string,
  user: string,
  password: string,
  host: string,
  port: string,
  relative: string,
  path: string,
  directory: string,
  file: string,
  query: string,
  anchor: string,
  parameters: {[key: string]: string}
}


/**
 * parser une URL.
 *
 * @param String uri l'uri à parser
 * @return Array un tableau contenant les éléments parsés
 */
type IParsedURIKeys = keyof IParsedURI;
export function parseUri(uri: string): IParsedURI {
  let keys: IParsedURIKeys[] = ["source", "protocol", "authority", "userInfo", "user",
    "password", "host", "port", "relative", "path", "directory", "file",
    "query", "anchor"];
  let strictParser = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
  let matches = strictParser.exec(uri);
  if (!matches) throw new Error('Unable to parse this url');
  let result: IParsedURI = {} as IParsedURI;

  for (let iKey = 14; iKey >= 0; iKey--) {
    (result as any)[keys[iKey]] = matches[iKey] || "";
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
    result += `${uri.protocol  }://`;
  }
  if (uri.user !== '') {
    result += uri.user;
    if (uri.password !== '') {
      result += `:${  uri.password}`;
    }
    result += "@";
  }
  result += uri.path;
  for (let queryKey in uri.parameters) {
    if (!first) {
      result += "&";
    } else {
      result += "?";
    }
    first = false;
    result += `${queryKey  }=${  uri.parameters[queryKey]}`;
  }
  return result;
}

export function queryGet(name: string, defaultValue: string) {
  name = name.replace(/[\[]/g, '[').replace(/[\]]/, ']');
  let regexS = `[\\?&]${  name  }=([^&#]*)`;
  let regex = new RegExp(regexS);
  let results = regex.exec(window.location.search);
  if (results === null) {
    return defaultValue;
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}


interface ImageResizerOptions {
  data?: string,
  height?: number,
  width?: number,
  image: HTMLImageElement
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
        canvas.height = image.naturalHeight * options.width / image.naturalWidth;
      }
    } else if (options.height && image.naturalHeight > options.height) {
      canvas.width = image.naturalWidth * options.height / image.naturalHeight;
      canvas.height = options.height;
    }
    let context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create 2D Context');
    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
    let data = canvas.toDataURL('image/jpeg', 0.7);
    cb(undefined, data);
  }
}


export function classNames(...args: any[]): string {
  let result = [];
  for (let arg of args) {
    if (!arg) continue;
    if (isObject(arg)) {
      for (let k in arg) {
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
  return dataUrl.substr(ipos + 1);
}

export function mimeTypeFromDataUrl(dataUrl: string) {
  const ipos = dataUrl.indexOf(',');
  return dataUrl.substr(5, ipos - 12);
}


const MIME_TO_EXT : {[mime: string]: string[]}= {"application/andrew-inset": ["ez"], "application/applixware": ["aw"], "application/atom+xml": ["atom"], "application/atomcat+xml": ["atomcat"], "application/atomdeleted+xml": ["atomdeleted"], "application/atomsvc+xml": ["atomsvc"], "application/atsc-dwd+xml": ["dwd"], "application/atsc-held+xml": ["held"], "application/atsc-rsat+xml": ["rsat"], "application/bdoc": ["bdoc"], "application/calendar+xml": ["xcs"], "application/ccxml+xml": ["ccxml"], "application/cdfx+xml": ["cdfx"], "application/cdmi-capability": ["cdmia"], "application/cdmi-container": ["cdmic"], "application/cdmi-domain": ["cdmid"], "application/cdmi-object": ["cdmio"], "application/cdmi-queue": ["cdmiq"], "application/cu-seeme": ["cu"], "application/dash+xml": ["mpd"], "application/davmount+xml": ["davmount"], "application/docbook+xml": ["dbk"], "application/dssc+der": ["dssc"], "application/dssc+xml": ["xdssc"], "application/ecmascript": ["ecma", "es"], "application/emma+xml": ["emma"], "application/emotionml+xml": ["emotionml"], "application/epub+zip": ["epub"], "application/exi": ["exi"], "application/fdt+xml": ["fdt"], "application/font-tdpfr": ["pfr"], "application/geo+json": ["geojson"], "application/gml+xml": ["gml"], "application/gpx+xml": ["gpx"], "application/gxf": ["gxf"], "application/gzip": ["gz"], "application/hjson": ["hjson"], "application/hyperstudio": ["stk"], "application/inkml+xml": ["ink", "inkml"], "application/ipfix": ["ipfix"], "application/its+xml": ["its"], "application/java-archive": ["jar", "war", "ear"], "application/java-serialized-object": ["ser"], "application/java-vm": ["class"], "application/javascript": ["js", "mjs"], "application/json": ["json", "map"], "application/json5": ["json5"], "application/jsonml+json": ["jsonml"], "application/ld+json": ["jsonld"], "application/lgr+xml": ["lgr"], "application/lost+xml": ["lostxml"], "application/mac-binhex40": ["hqx"], "application/mac-compactpro": ["cpt"], "application/mads+xml": ["mads"], "application/manifest+json": ["webmanifest"], "application/marc": ["mrc"], "application/marcxml+xml": ["mrcx"], "application/mathematica": ["ma", "nb", "mb"], "application/mathml+xml": ["mathml"], "application/mbox": ["mbox"], "application/mediaservercontrol+xml": ["mscml"], "application/metalink+xml": ["metalink"], "application/metalink4+xml": ["meta4"], "application/mets+xml": ["mets"], "application/mmt-aei+xml": ["maei"], "application/mmt-usd+xml": ["musd"], "application/mods+xml": ["mods"], "application/mp21": ["m21", "mp21"], "application/mp4": ["mp4s", "m4p"], "application/mrb-consumer+xml": ["*xdf"], "application/mrb-publish+xml": ["*xdf"], "application/msword": ["doc", "dot"], "application/mxf": ["mxf"], "application/n-quads": ["nq"], "application/n-triples": ["nt"], "application/node": ["cjs"], "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"], "application/oda": ["oda"], "application/oebps-package+xml": ["opf"], "application/ogg": ["ogx"], "application/omdoc+xml": ["omdoc"], "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"], "application/oxps": ["oxps"], "application/p2p-overlay+xml": ["relo"], "application/patch-ops-error+xml": ["*xer"], "application/pdf": ["pdf"], "application/pgp-encrypted": ["pgp"], "application/pgp-signature": ["asc", "sig"], "application/pics-rules": ["prf"], "application/pkcs10": ["p10"], "application/pkcs7-mime": ["p7m", "p7c"], "application/pkcs7-signature": ["p7s"], "application/pkcs8": ["p8"], "application/pkix-attr-cert": ["ac"], "application/pkix-cert": ["cer"], "application/pkix-crl": ["crl"], "application/pkix-pkipath": ["pkipath"], "application/pkixcmp": ["pki"], "application/pls+xml": ["pls"], "application/postscript": ["ai", "eps", "ps"], "application/provenance+xml": ["provx"], "application/pskc+xml": ["pskcxml"], "application/raml+yaml": ["raml"], "application/rdf+xml": ["rdf", "owl"], "application/reginfo+xml": ["rif"], "application/relax-ng-compact-syntax": ["rnc"], "application/resource-lists+xml": ["rl"], "application/resource-lists-diff+xml": ["rld"], "application/rls-services+xml": ["rs"], "application/route-apd+xml": ["rapd"], "application/route-s-tsid+xml": ["sls"], "application/route-usd+xml": ["rusd"], "application/rpki-ghostbusters": ["gbr"], "application/rpki-manifest": ["mft"], "application/rpki-roa": ["roa"], "application/rsd+xml": ["rsd"], "application/rss+xml": ["rss"], "application/rtf": ["rtf"], "application/sbml+xml": ["sbml"], "application/scvp-cv-request": ["scq"], "application/scvp-cv-response": ["scs"], "application/scvp-vp-request": ["spq"], "application/scvp-vp-response": ["spp"], "application/sdp": ["sdp"], "application/senml+xml": ["senmlx"], "application/sensml+xml": ["sensmlx"], "application/set-payment-initiation": ["setpay"], "application/set-registration-initiation": ["setreg"], "application/shf+xml": ["shf"], "application/sieve": ["siv", "sieve"], "application/smil+xml": ["smi", "smil"], "application/sparql-query": ["rq"], "application/sparql-results+xml": ["srx"], "application/srgs": ["gram"], "application/srgs+xml": ["grxml"], "application/sru+xml": ["sru"], "application/ssdl+xml": ["ssdl"], "application/ssml+xml": ["ssml"], "application/swid+xml": ["swidtag"], "application/tei+xml": ["tei", "teicorpus"], "application/thraud+xml": ["tfi"], "application/timestamped-data": ["tsd"], "application/toml": ["toml"], "application/ttml+xml": ["ttml"], "application/urc-ressheet+xml": ["rsheet"], "application/voicexml+xml": ["vxml"], "application/wasm": ["wasm"], "application/widget": ["wgt"], "application/winhlp": ["hlp"], "application/wsdl+xml": ["wsdl"], "application/wspolicy+xml": ["wspolicy"], "application/xaml+xml": ["xaml"], "application/xcap-att+xml": ["xav"], "application/xcap-caps+xml": ["xca"], "application/xcap-diff+xml": ["xdf"], "application/xcap-el+xml": ["xel"], "application/xcap-error+xml": ["xer"], "application/xcap-ns+xml": ["xns"], "application/xenc+xml": ["xenc"], "application/xhtml+xml": ["xhtml", "xht"], "application/xliff+xml": ["xlf"], "application/xml": ["xml", "xsl", "xsd", "rng"], "application/xml-dtd": ["dtd"], "application/xop+xml": ["xop"], "application/xproc+xml": ["xpl"], "application/xslt+xml": ["xslt"], "application/xspf+xml": ["xspf"], "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"], "application/yang": ["yang"], "application/yin+xml": ["yin"], "application/zip": ["zip"], "audio/3gpp": ["*3gpp"], "audio/adpcm": ["adp"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mobile-xmf": ["mxmf"], "audio/mp3": ["*mp3"], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/wav": ["wav"], "audio/wave": ["*wav"], "audio/webm": ["weba"], "audio/xm": ["xm"], "font/collection": ["ttc"], "font/otf": ["otf"], "font/ttf": ["ttf"], "font/woff": ["woff"], "font/woff2": ["woff2"], "image/aces": ["exr"], "image/apng": ["apng"], "image/bmp": ["bmp"], "image/cgm": ["cgm"], "image/dicom-rle": ["drle"], "image/emf": ["emf"], "image/fits": ["fits"], "image/g3fax": ["g3"], "image/gif": ["gif"], "image/heic": ["heic"], "image/heic-sequence": ["heics"], "image/heif": ["heif"], "image/heif-sequence": ["heifs"], "image/hej2k": ["hej2"], "image/hsj2": ["hsj2"], "image/ief": ["ief"], "image/jls": ["jls"], "image/jp2": ["jp2", "jpg2"], "image/jpeg": ["jpeg", "jpg", "jpe"], "image/jph": ["jph"], "image/jphc": ["jhc"], "image/jpm": ["jpm"], "image/jpx": ["jpx", "jpf"], "image/jxr": ["jxr"], "image/jxra": ["jxra"], "image/jxrs": ["jxrs"], "image/jxs": ["jxs"], "image/jxsc": ["jxsc"], "image/jxsi": ["jxsi"], "image/jxss": ["jxss"], "image/ktx": ["ktx"], "image/png": ["png"], "image/sgi": ["sgi"], "image/svg+xml": ["svg", "svgz"], "image/t38": ["t38"], "image/tiff": ["tif", "tiff"], "image/tiff-fx": ["tfx"], "image/webp": ["webp"], "image/wmf": ["wmf"], "message/disposition-notification": ["disposition-notification"], "message/global": ["u8msg"], "message/global-delivery-status": ["u8dsn"], "message/global-disposition-notification": ["u8mdn"], "message/global-headers": ["u8hdr"], "message/rfc822": ["eml", "mime"], "model/3mf": ["3mf"], "model/gltf+json": ["gltf"], "model/gltf-binary": ["glb"], "model/iges": ["igs", "iges"], "model/mesh": ["msh", "mesh", "silo"], "model/mtl": ["mtl"], "model/obj": ["obj"], "model/stl": ["stl"], "model/vrml": ["wrl", "vrml"], "model/x3d+binary": ["*x3db", "x3dbz"], "model/x3d+fastinfoset": ["x3db"], "model/x3d+vrml": ["*x3dv", "x3dvz"], "model/x3d+xml": ["x3d", "x3dz"], "model/x3d-vrml": ["x3dv"], "text/cache-manifest": ["appcache", "manifest"], "text/calendar": ["ics", "ifb"], "text/coffeescript": ["coffee", "litcoffee"], "text/css": ["css"], "text/csv": ["csv"], "text/html": ["html", "htm", "shtml"], "text/jade": ["jade"], "text/jsx": ["jsx"], "text/less": ["less"], "text/markdown": ["markdown", "md"], "text/mathml": ["mml"], "text/mdx": ["mdx"], "text/n3": ["n3"], "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"], "text/richtext": ["rtx"], "text/rtf": ["*rtf"], "text/sgml": ["sgml", "sgm"], "text/shex": ["shex"], "text/slim": ["slim", "slm"], "text/stylus": ["stylus", "styl"], "text/tab-separated-values": ["tsv"], "text/troff": ["t", "tr", "roff", "man", "me", "ms"], "text/turtle": ["ttl"], "text/uri-list": ["uri", "uris", "urls"], "text/vcard": ["vcard"], "text/vtt": ["vtt"], "text/xml": ["*xml"], "text/yaml": ["yaml", "yml"], "video/3gpp": ["3gp", "3gpp"], "video/3gpp2": ["3g2"], "video/h261": ["h261"], "video/h263": ["h263"], "video/h264": ["h264"], "video/jpeg": ["jpgv"], "video/jpm": ["*jpm", "jpgm"], "video/mj2": ["mj2", "mjp2"], "video/mp2t": ["ts"], "video/mp4": ["mp4", "mp4v", "mpg4"], "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"], "video/ogg": ["ogv"], "video/quicktime": ["qt", "mov"], "video/webm": ["webm"]};
export function mimetype(filename: string) {
  let match = /\.(.+)$/.exec(filename);
  if (match) for (let mime in MIME_TO_EXT) {
    if (MIME_TO_EXT[mime].indexOf(match[1]) !== -1) return mime;
  }
  return 'unknown';
}