export * from './ascii-emojies';
export * from './emojies-list';

import { asciiList } from './ascii-emojies';
import { emojioneList } from './emojies-list';

let unicodeReplacementRegEx: string;
let memMapShortToUnicodeCharacters: { [key: string]: string };
let tmpShortNames: string[] = [];
let emoji: string;
for (emoji in emojioneList) {
  if (!emojioneList.hasOwnProperty(emoji)) continue;
  tmpShortNames.push(emoji.replace(/[+]/g, '\\$&'));
}
let shortnames = tmpShortNames.join('|');

let asciiRegexp =
  "(\\<3|&lt;3|\\<\\/3|&lt;\\/3|\\:'\\)|\\:'\\-\\)|\\:D|\\:\\-D|\\=D|\\:\\)|\\:\\-\\)|\\=\\]|\\=\\)|\\:\\]|'\\:\\)|'\\:\\-\\)|'\\=\\)|'\\:D|'\\:\\-D|'\\=D|\\>\\:\\)|&gt;\\:\\)|\\>;\\)|&gt;;\\)|\\>\\:\\-\\)|&gt;\\:\\-\\)|\\>\\=\\)|&gt;\\=\\)|;\\)|;\\-\\)|\\*\\-\\)|\\*\\)|;\\-\\]|;\\]|;D|;\\^\\)|'\\:\\(|'\\:\\-\\(|'\\=\\(|\\:\\*|\\:\\-\\*|\\=\\*|\\:\\^\\*|\\>\\:P|&gt;\\:P|X\\-P|x\\-p|\\>\\:\\[|&gt;\\:\\[|\\:\\-\\(|\\:\\(|\\:\\-\\[|\\:\\[|\\=\\(|\\>\\:\\(|&gt;\\:\\(|\\>\\:\\-\\(|&gt;\\:\\-\\(|\\:@|\\:'\\(|\\:'\\-\\(|;\\(|;\\-\\(|\\>\\.\\<|&gt;\\.&lt;|D\\:|\\:\\$|\\=\\$|#\\-\\)|#\\)|%\\-\\)|%\\)|X\\)|X\\-\\)|\\*\\\\0\\/\\*|\\\\0\\/|\\*\\\\O\\/\\*|\\\\O\\/|O\\:\\-\\)|0\\:\\-3|0\\:3|0\\:\\-\\)|0\\:\\)|0;\\^\\)|O\\:\\-\\)|O\\:\\)|O;\\-\\)|O\\=\\)|0;\\-\\)|O\\:\\-3|O\\:3|B\\-\\)|B\\)|8\\)|8\\-\\)|B\\-D|8\\-D|\\-_\\-|\\-__\\-|\\-___\\-|\\>\\:\\\\|&gt;\\:\\\\|\\>\\:\\/|&gt;\\:\\/|\\:\\-\\/|\\:\\-\\.|\\:\\/|\\:\\\\|\\=\\/|\\=\\\\|\\:L|\\=L|\\:P|\\:\\-P|\\=P|\\:\\-p|\\:p|\\=p|\\:\\-Þ|\\:\\-&THORN;|\\:Þ|\\:&THORN;|\\:þ|\\:&thorn;|\\:\\-þ|\\:\\-&thorn;|\\:\\-b|\\:b|d\\:|\\:\\-O|\\:O|\\:\\-o|\\:o|O_O|\\>\\:O|&gt;\\:O|\\:\\-X|\\:X|\\:\\-#|\\:#|\\=X|\\=x|\\:x|\\:\\-x|\\=#)";
let regShortNames = new RegExp(
  '<object[^>]*>.*?</object>|<span[^>]*>.*?</span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|(' + shortnames + ')',
  'gi'
);
let regAscii = new RegExp(
  '<object[^>]*>.*?</object>|<span[^>]*>.*?</span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|((\\s|^)' +
    asciiRegexp +
    '(?=\\s|$|[!,.?]))',
  'g'
);

// will output unicode from shortname
// useful for sending emojis back to mobile devices
export function shortnameToUnicode(str: string) {
  // replace regular shortnames first
  let unicode;
  str = str.replace(regShortNames, (shortname: string) => {
    if (typeof shortname === 'undefined' || shortname === '' || !(shortname in emojioneList)) {
      // if the shortname doesnt exist just return the entire match
      return shortname;
    }
    unicode = emojioneList[shortname].unicode[0].toUpperCase();
    return convert(unicode);
  });

  str = str.replace(regAscii, (entire: string, _m1: string, m2: string, m3: string) => {
    if (typeof m3 === 'undefined' || m3 === '' || !(unescapeHTML(m3) in asciiList)) {
      // if the shortname doesnt exist just return the entire match
      return entire;
    }

    m3 = unescapeHTML(m3);
    unicode = asciiList[m3].toUpperCase();
    return m2 + convert(unicode);
  });

  return str;
}

let bundlePath = 'assets/svgs/emojies.svg';
export function setBundlePath(path: string) {
  bundlePath = path;
}

export function shortnameToImage(str: string) {
  let replaceWith: string;
  let unicode: string;
  str = str.replace(regShortNames, (shortname) => {
    if (typeof shortname === 'undefined' || shortname === '' || !(shortname in emojioneList)) {
      return shortname;
    } else {
      unicode = emojioneList[shortname].unicode[emojioneList[shortname].unicode.length - 1];
      replaceWith = `<svg class="emoji"><use xlink:href="${bundlePath}#emoji-${unicode}"></use></svg>`;
      return replaceWith;
    }
  });

  str = str.replace(regAscii, (entire, _m1, m2, m3: string) => {
    if (typeof m3 === 'undefined' || m3 === '' || !(unescapeHTML(m3) in asciiList)) {
      // if the shortname doesnt exist just return the entire match
      return entire;
    }

    m3 = unescapeHTML(m3);
    unicode = asciiList[m3];

    replaceWith = `${m2}<svg class="emoji"><use xlink:href="${bundlePath}#emoji-${unicode}"></use></svg>`;
    return replaceWith;
  });

  return str;
}

export function stripShortNames(str: string) {
  str = str.replace(regShortNames, (shortname) => {
    if (typeof shortname === 'undefined' || shortname === '' || !(shortname in emojioneList)) {
      return shortname;
    } else {
      return '';
    }
  });

  str = str.replace(regAscii, (entire, _m1, _m2, m3: string) => {
    if (typeof m3 === 'undefined' || m3 === '' || !(unescapeHTML(m3) in asciiList)) {
      return entire;
    }

    return '';
  });

  return str;
}

export function toShort(str: string) {
  let find = getUnicodeReplacementRegEx();
  let replacementList = mapUnicodeCharactersToShort();
  return replaceAll(str, find, replacementList);
}

// for converting unicode code points and code pairs to their respective characters
function convert(unicode: string) {
  if (unicode.indexOf('-') > -1) {
    let parts = [];
    let s = unicode.split('-');
    for (let c of s) {
      let part = parseInt(c, 16);
      let sPart;
      if (part >= 0x10000 && part <= 0x10ffff) {
        let hi = Math.floor((part - 0x10000) / 0x400) + 0xd800;
        let lo = ((part - 0x10000) % 0x400) + 0xdc00;
        sPart = String.fromCharCode(hi) + String.fromCharCode(lo);
      } else {
        sPart = String.fromCharCode(part);
      }
      parts.push(sPart);
    }
    return parts.join('');
  } else {
    let s = parseInt(unicode, 16);
    if (s >= 0x10000 && s <= 0x10ffff) {
      let hi = Math.floor((s - 0x10000) / 0x400) + 0xd800;
      let lo = ((s - 0x10000) % 0x400) + 0xdc00;
      return String.fromCharCode(hi) + String.fromCharCode(lo);
    } else {
      return String.fromCharCode(s);
    }
  }
}

export function escapeHTML(string: string) {
  const escaped: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
    ' ': '&nbsp;',
    '¢': '&cent;',
    '£': '&pound;',
    '¥': '&yen;',
    '€': '&euro;',
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '§': '&sect;',
    '°': '&deg;',
    '¶': '&para;',
    '»': '&raquo;',
    '«': '&laquo;',
    '¡': '&iexcl;',
    '¿': '&iquest;',
    á: '&aacute;',
    é: '&eacute;',
    í: '&iacute;',
    ó: '&oacute;',
    ú: '&uacute;',
    ñ: '&ntilde;',
    ü: '&uuml;',
    º: '&ordm;',
    ª: '&ordf;',
  };

  return string.replace(/[&<>"'¢£¥€©®™§°¶»«¡¿áéíóúñüºª]/g, (match) => {
    return escaped[match];
  });
}

export function unescapeHTML(string: string) {
  const unescaped: { [key: string]: string } = {
    '&amp;': '&',
    '&#38;': '&',
    '&#x26;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&#x3C;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&#x3E;': '>',
    '&quot;': '"',
    '&#34;': '"',
    '&#x22;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#x27;': "'",
    '&nbsp;': ' ',
    '&#160;': ' ',
    '&#xA0;': ' ',
    '&cent;': '¢',
    '&#162;': '¢',
    '&#xA2;': '¢',
    '&pound;': '£',
    '&#163;': '£',
    '&#xA3;': '£',
    '&yen;': '¥',
    '&#165;': '¥',
    '&#xA5;': '¥',
    '&euro;': '€',
    '&#8364;': '€',
    '&#x20AC;': '€',
    '&copy;': '©',
    '&#169;': '©',
    '&#xA9;': '©',
    '&reg;': '®',
    '&#174;': '®',
    '&#xAE;': '®',
    '&trade;': '™',
    '&#8482;': '™',
    '&#x2122;': '™',
    '&sect;': '§',
    '&#167;': '§',
    '&#xA7;': '§',
    '&deg;': '°',
    '&#176;': '°',
    '&#xB0;': '°',
    '&para;': '¶',
    '&#182;': '¶',
    '&#xB6;': '¶',
    '&raquo;': '»',
    '&#187;': '»',
    '&#xBB;': '»',
    '&laquo;': '«',
    '&#171;': '«',
    '&#xAB;': '«',
    '&iexcl;': '¡',
    '&#161;': '¡',
    '&#xA1;': '¡',
    '&iquest;': '¿',
    '&#191;': '¿',
    '&#xBF;': '¿',
    '&aacute;': 'á',
    '&#225;': 'á',
    '&#xE1;': 'á',
    '&eacute;': 'é',
    '&#233;': 'é',
    '&#xE9;': 'é',
    '&iacute;': 'í',
    '&#237;': 'í',
    '&#xED;': 'í',
    '&oacute;': 'ó',
    '&#243;': 'ó',
    '&#xF3;': 'ó',
    '&uacute;': 'ú',
    '&#250;': 'ú',
    '&#xFA;': 'ú',
    '&ntilde;': 'ñ',
    '&#241;': 'ñ',
    '&#xF1;': 'ñ',
    '&uuml;': 'ü',
    '&#252;': 'ü',
    '&#xFC;': 'ü',
    '&ordm;': 'º',
    '&#186;': 'º',
    '&#xBA;': 'º',
    '&ordf;': 'ª',
    '&#170;': 'ª',
    '&#xAA;': 'ª',
  };

  return string.replace(
    /&(?:amp|#38|#x26|lt|#60|#x3C|gt|#62|#x3E|quot|#34|#x22|apos|#39|#x27|nbsp|#160|#xA0|cent|#162|#xA2|pound|#163|#xA3|yen|#165|#xA5|euro|#8364|#x20AC|copy|#169|#xA9|reg|#174|#xAE|trade|#8482|#x2122|sect|#167|#xA7|deg|#176|#xB0|para|#182|#xB6|raquo|#187|#xBB|laquo|#171|#xAB|iexcl|#161|#xA1|iquest|#191|#xBF|aacute|#225|#xE1|eacute|#233|#xE9|iacute|#237|#xED|oacute|#243|#xF3|uacute|#250|#xFA|ntilde|#241|#xF1|uuml|#252|#xFC|ordm|#186|#xBA|ordf|#170|#xAA);/gi,
    (match) => {
      return unescaped[match];
    }
  );
}

function mapEmojioneList(addToMapStorage: (unicode: string, shortname: string) => void) {
  for (let shortname in emojioneList) {
    if (!emojioneList.hasOwnProperty(shortname)) {
      continue;
    }
    for (let i = 0, len = emojioneList[shortname].unicode.length; i < len; i++) {
      let unicode = emojioneList[shortname].unicode[i];
      addToMapStorage(unicode, shortname);
    }
  }
}

function memoizeReplacement() {
  if (!unicodeReplacementRegEx || !memMapShortToUnicodeCharacters) {
    let unicodeList: string[] = [];
    memMapShortToUnicodeCharacters = {};
    mapEmojioneList((unicode: string, shortname: string) => {
      let emojiCharacter = convert(unicode);
      if (emojioneList[shortname].isCanonical) {
        memMapShortToUnicodeCharacters[emojiCharacter] = shortname;
      }
      unicodeList.push(emojiCharacter);
    });
    unicodeReplacementRegEx = unicodeList.join('|');
  }
}

function mapUnicodeCharactersToShort() {
  memoizeReplacement();
  return memMapShortToUnicodeCharacters;
}

function getUnicodeReplacementRegEx() {
  memoizeReplacement();
  return unicodeReplacementRegEx;
}

function escapeRegExp(string: string) {
  return string.replace(/[-[\]{}()*+?.,;:&\\^$#\s]/g, '\\$&');
}

function replaceAll(string: string, find: string, replacementList: { [k: string]: string }) {
  let escapedFind = escapeRegExp(find);
  let search = new RegExp(
    '<object[^>]*>.*?</object>|<span[^>]*>.*?</span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|(' +
      escapedFind +
      ')',
    'gi'
  );

  // callback prevents replacing anything inside of these common html tags as well as between an <object></object> tag
  let replace = (entire: string, m1: string) => {
    return typeof m1 === 'undefined' || m1 === '' ? entire : replacementList[m1];
  };

  return string.replace(search, replace);
}

export function sanitizeText(input: string) {
  if (!input) return input;
  input = input.replace(/(<([^>]+)>)/gi, '');
  return toShort(input);
}
