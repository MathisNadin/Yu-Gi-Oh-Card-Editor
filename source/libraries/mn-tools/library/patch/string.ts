import { isArray, monkeyPatch } from '../..';

// eslint-disable-next-line @typescript-eslint/ban-types
const prototype: { [name: string]: Function } = {};

prototype.toCamelCase = function (this: string) {
  return this.replace(/([^a-z][a-z])/g, ($1) => {
    return $1.toUpperCase().replace(/[^a-z]/, '');
  });
};

// accent-folding function
const _accentMap: { [key: string]: string } = {
  ẚ: 'a',
  Á: 'a',
  á: 'a',
  À: 'a',
  à: 'a',
  Ă: 'a',
  ă: 'a',
  Ắ: 'a',
  ắ: 'a',
  Ằ: 'a',
  ằ: 'a',
  Ẵ: 'a',
  ẵ: 'a',
  Ẳ: 'a',
  ẳ: 'a',
  Â: 'a',
  â: 'a',
  Ấ: 'a',
  ấ: 'a',
  Ầ: 'a',
  ầ: 'a',
  Ẫ: 'a',
  ẫ: 'a',
  Ẩ: 'a',
  ẩ: 'a',
  Ǎ: 'a',
  ǎ: 'a',
  Å: 'a',
  å: 'a',
  Ǻ: 'a',
  ǻ: 'a',
  Ä: 'a',
  ä: 'a',
  Ǟ: 'a',
  ǟ: 'a',
  Ã: 'a',
  ã: 'a',
  Ȧ: 'a',
  ȧ: 'a',
  Ǡ: 'a',
  ǡ: 'a',
  Ą: 'a',
  ą: 'a',
  Ā: 'a',
  ā: 'a',
  Ả: 'a',
  ả: 'a',
  Ȁ: 'a',
  ȁ: 'a',
  Ȃ: 'a',
  ȃ: 'a',
  Ạ: 'a',
  ạ: 'a',
  Ặ: 'a',
  ặ: 'a',
  Ậ: 'a',
  ậ: 'a',
  Ḁ: 'a',
  ḁ: 'a',
  Ⱥ: 'a',
  ⱥ: 'a',
  Ǽ: 'a',
  ǽ: 'a',
  Ǣ: 'a',
  ǣ: 'a',
  Ḃ: 'b',
  ḃ: 'b',
  Ḅ: 'b',
  ḅ: 'b',
  Ḇ: 'b',
  ḇ: 'b',
  Ƀ: 'b',
  ƀ: 'b',
  ᵬ: 'b',
  Ɓ: 'b',
  ɓ: 'b',
  Ƃ: 'b',
  ƃ: 'b',
  Ć: 'c',
  ć: 'c',
  Ĉ: 'c',
  ĉ: 'c',
  Č: 'c',
  č: 'c',
  Ċ: 'c',
  ċ: 'c',
  Ç: 'c',
  ç: 'c',
  Ḉ: 'c',
  ḉ: 'c',
  Ȼ: 'c',
  ȼ: 'c',
  Ƈ: 'c',
  ƈ: 'c',
  ɕ: 'c',
  Ď: 'd',
  ď: 'd',
  Ḋ: 'd',
  ḋ: 'd',
  Ḑ: 'd',
  ḑ: 'd',
  Ḍ: 'd',
  ḍ: 'd',
  Ḓ: 'd',
  ḓ: 'd',
  Ḏ: 'd',
  ḏ: 'd',
  Đ: 'd',
  đ: 'd',
  ᵭ: 'd',
  Ɖ: 'd',
  ɖ: 'd',
  Ɗ: 'd',
  ɗ: 'd',
  Ƌ: 'd',
  ƌ: 'd',
  ȡ: 'd',
  ð: 'd',
  É: 'e',
  Ə: 'e',
  Ǝ: 'e',
  ǝ: 'e',
  é: 'e',
  È: 'e',
  è: 'e',
  Ĕ: 'e',
  ĕ: 'e',
  Ê: 'e',
  ê: 'e',
  Ế: 'e',
  ế: 'e',
  Ề: 'e',
  ề: 'e',
  Ễ: 'e',
  ễ: 'e',
  Ể: 'e',
  ể: 'e',
  Ě: 'e',
  ě: 'e',
  Ë: 'e',
  ë: 'e',
  Ẽ: 'e',
  ẽ: 'e',
  Ė: 'e',
  ė: 'e',
  Ȩ: 'e',
  ȩ: 'e',
  Ḝ: 'e',
  ḝ: 'e',
  Ę: 'e',
  ę: 'e',
  Ē: 'e',
  ē: 'e',
  Ḗ: 'e',
  ḗ: 'e',
  Ḕ: 'e',
  ḕ: 'e',
  Ẻ: 'e',
  ẻ: 'e',
  Ȅ: 'e',
  ȅ: 'e',
  Ȇ: 'e',
  ȇ: 'e',
  Ẹ: 'e',
  ẹ: 'e',
  Ệ: 'e',
  ệ: 'e',
  Ḙ: 'e',
  ḙ: 'e',
  Ḛ: 'e',
  ḛ: 'e',
  Ɇ: 'e',
  ɇ: 'e',
  ɚ: 'e',
  ɝ: 'e',
  Ḟ: 'f',
  ḟ: 'f',
  ᵮ: 'f',
  Ƒ: 'f',
  ƒ: 'f',
  Ǵ: 'g',
  ǵ: 'g',
  Ğ: 'g',
  ğ: 'g',
  Ĝ: 'g',
  ĝ: 'g',
  Ǧ: 'g',
  ǧ: 'g',
  Ġ: 'g',
  ġ: 'g',
  Ģ: 'g',
  ģ: 'g',
  Ḡ: 'g',
  ḡ: 'g',
  Ǥ: 'g',
  ǥ: 'g',
  Ɠ: 'g',
  ɠ: 'g',
  Ĥ: 'h',
  ĥ: 'h',
  Ȟ: 'h',
  ȟ: 'h',
  Ḧ: 'h',
  ḧ: 'h',
  Ḣ: 'h',
  ḣ: 'h',
  Ḩ: 'h',
  ḩ: 'h',
  Ḥ: 'h',
  ḥ: 'h',
  Ḫ: 'h',
  ḫ: 'h',
  H: 'h',
  ẖ: 'h',
  Ħ: 'h',
  ħ: 'h',
  Ⱨ: 'h',
  ⱨ: 'h',
  Í: 'i',
  í: 'i',
  Ì: 'i',
  ì: 'i',
  Ĭ: 'i',
  ĭ: 'i',
  Î: 'i',
  î: 'i',
  Ǐ: 'i',
  ǐ: 'i',
  Ï: 'i',
  ï: 'i',
  Ḯ: 'i',
  ḯ: 'i',
  Ĩ: 'i',
  ĩ: 'i',
  İ: 'i',
  i: 'i',
  Į: 'i',
  į: 'i',
  Ī: 'i',
  ī: 'i',
  Ỉ: 'i',
  ỉ: 'i',
  Ȉ: 'i',
  ȉ: 'i',
  Ȋ: 'i',
  ȋ: 'i',
  Ị: 'i',
  ị: 'i',
  Ḭ: 'i',
  ḭ: 'i',
  I: 'i',
  ı: 'i',
  Ɨ: 'i',
  ɨ: 'i',
  Ĵ: 'j',
  ĵ: 'j',
  J: 'j',
  ǰ: 'j',
  ȷ: 'j',
  Ɉ: 'j',
  ɉ: 'j',
  ʝ: 'j',
  ɟ: 'j',
  ʄ: 'j',
  Ḱ: 'k',
  ḱ: 'k',
  Ǩ: 'k',
  ǩ: 'k',
  Ķ: 'k',
  ķ: 'k',
  Ḳ: 'k',
  ḳ: 'k',
  Ḵ: 'k',
  ḵ: 'k',
  Ƙ: 'k',
  ƙ: 'k',
  Ⱪ: 'k',
  ⱪ: 'k',
  Ĺ: 'a',
  ĺ: 'l',
  Ľ: 'l',
  ľ: 'l',
  Ļ: 'l',
  ļ: 'l',
  Ḷ: 'l',
  ḷ: 'l',
  Ḹ: 'l',
  ḹ: 'l',
  Ḽ: 'l',
  ḽ: 'l',
  Ḻ: 'l',
  ḻ: 'l',
  Ł: 'l',
  Ŀ: 'l',
  ŀ: 'l',
  Ƚ: 'l',
  ƚ: 'l',
  Ⱡ: 'l',
  ⱡ: 'l',
  Ɫ: 'l',
  ɫ: 'l',
  ɬ: 'l',
  ɭ: 'l',
  ȴ: 'l',
  Ḿ: 'm',
  ḿ: 'm',
  Ṁ: 'm',
  ṁ: 'm',
  Ṃ: 'm',
  ṃ: 'm',
  ɱ: 'm',
  Ń: 'n',
  ń: 'n',
  Ǹ: 'n',
  ǹ: 'n',
  Ň: 'n',
  ň: 'n',
  Ñ: 'n',
  ñ: 'n',
  Ṅ: 'n',
  ṅ: 'n',
  Ņ: 'n',
  ņ: 'n',
  Ṇ: 'n',
  ṇ: 'n',
  Ṋ: 'n',
  ṋ: 'n',
  Ṉ: 'n',
  ṉ: 'n',
  Ɲ: 'n',
  ɲ: 'n',
  Ƞ: 'n',
  ƞ: 'n',
  ɳ: 'n',
  ȵ: 'n',
  N: 'n',
  n: 'n',
  Ó: 'o',
  ó: 'o',
  Ò: 'o',
  ò: 'o',
  Ŏ: 'o',
  ŏ: 'o',
  Ô: 'o',
  ô: 'o',
  Ố: 'o',
  ố: 'o',
  Ồ: 'o',
  ồ: 'o',
  Ỗ: 'o',
  ỗ: 'o',
  Ổ: 'o',
  ổ: 'o',
  Ǒ: 'o',
  ǒ: 'o',
  Ö: 'o',
  ö: 'o',
  Ȫ: 'o',
  ȫ: 'o',
  Ő: 'o',
  ő: 'o',
  Õ: 'o',
  õ: 'o',
  Ṍ: 'o',
  ṍ: 'o',
  Ṏ: 'o',
  ṏ: 'o',
  Ȭ: 'o',
  ȭ: 'o',
  Ȯ: 'o',
  ȯ: 'o',
  Ȱ: 'o',
  ȱ: 'o',
  Ø: 'o',
  ø: 'o',
  Ǿ: 'o',
  ǿ: 'o',
  Ǫ: 'o',
  ǫ: 'o',
  Ǭ: 'o',
  ǭ: 'o',
  Ō: 'o',
  ō: 'o',
  Ṓ: 'o',
  ṓ: 'o',
  Ṑ: 'o',
  ṑ: 'o',
  Ỏ: 'o',
  ỏ: 'o',
  Ȍ: 'o',
  ȍ: 'o',
  Ȏ: 'o',
  ȏ: 'o',
  Ơ: 'o',
  ơ: 'o',
  Ớ: 'o',
  ớ: 'o',
  Ờ: 'o',
  ờ: 'o',
  Ỡ: 'o',
  ỡ: 'o',
  Ở: 'o',
  ở: 'o',
  Ợ: 'o',
  ợ: 'o',
  Ọ: 'o',
  ọ: 'o',
  Ộ: 'o',
  ộ: 'o',
  Ɵ: 'o',
  ɵ: 'o',
  Ṕ: 'p',
  ṕ: 'p',
  Ṗ: 'p',
  ṗ: 'p',
  Ᵽ: 'p',
  Ƥ: 'p',
  ƥ: 'p',
  P: 'p',
  p: 'p',
  ʠ: 'q',
  Ɋ: 'q',
  ɋ: 'q',
  Ŕ: 'r',
  ŕ: 'r',
  Ř: 'r',
  ř: 'r',
  Ṙ: 'r',
  ṙ: 'r',
  Ŗ: 'r',
  ŗ: 'r',
  Ȑ: 'r',
  ȑ: 'r',
  Ȓ: 'r',
  ȓ: 'r',
  Ṛ: 'r',
  ṛ: 'r',
  Ṝ: 'r',
  ṝ: 'r',
  Ṟ: 'r',
  ṟ: 'r',
  Ɍ: 'r',
  ɍ: 'r',
  ᵲ: 'r',
  ɼ: 'r',
  Ɽ: 'r',
  ɽ: 'r',
  ɾ: 'r',
  ᵳ: 'r',
  ß: 's',
  Ś: 's',
  ś: 's',
  Ṥ: 's',
  ṥ: 's',
  Ŝ: 's',
  ŝ: 's',
  Š: 's',
  š: 's',
  Ṧ: 's',
  ṧ: 's',
  Ṡ: 's',
  ṡ: 's',
  ẛ: 's',
  Ş: 's',
  ş: 's',
  Ṣ: 's',
  ṣ: 's',
  Ṩ: 's',
  ṩ: 's',
  Ș: 's',
  ș: 's',
  ʂ: 's',
  S: 's',
  s: 's',
  Þ: 't',
  þ: 't',
  Ť: 't',
  ť: 't',
  T: 't',
  ẗ: 't',
  Ṫ: 't',
  ṫ: 't',
  Ţ: 't',
  ţ: 't',
  Ṭ: 't',
  ṭ: 't',
  Ț: 't',
  ț: 't',
  Ṱ: 't',
  ṱ: 't',
  Ṯ: 't',
  ṯ: 't',
  Ŧ: 't',
  ŧ: 't',
  Ⱦ: 't',
  ⱦ: 't',
  ᵵ: 't',
  ƫ: 't',
  Ƭ: 't',
  ƭ: 't',
  Ʈ: 't',
  ʈ: 't',
  ȶ: 't',
  Ú: 'u',
  ú: 'u',
  Ù: 'u',
  ù: 'u',
  Ŭ: 'u',
  ŭ: 'u',
  Û: 'u',
  û: 'u',
  Ǔ: 'u',
  ǔ: 'u',
  Ů: 'u',
  ů: 'u',
  Ü: 'u',
  ü: 'u',
  Ǘ: 'u',
  ǘ: 'u',
  Ǜ: 'u',
  ǜ: 'u',
  Ǚ: 'u',
  ǚ: 'u',
  Ǖ: 'u',
  ǖ: 'u',
  Ű: 'u',
  ű: 'u',
  Ũ: 'u',
  ũ: 'u',
  Ṹ: 'u',
  ṹ: 'u',
  Ų: 'u',
  ų: 'u',
  Ū: 'u',
  ū: 'u',
  Ṻ: 'u',
  ṻ: 'u',
  Ủ: 'u',
  ủ: 'u',
  Ȕ: 'u',
  ȕ: 'u',
  Ȗ: 'u',
  ȗ: 'u',
  Ư: 'u',
  ư: 'u',
  Ứ: 'u',
  ứ: 'u',
  Ừ: 'u',
  ừ: 'u',
  Ữ: 'u',
  ữ: 'u',
  Ử: 'u',
  ử: 'u',
  Ự: 'u',
  ự: 'u',
  Ụ: 'u',
  ụ: 'u',
  Ṳ: 'u',
  ṳ: 'u',
  Ṷ: 'u',
  ṷ: 'u',
  Ṵ: 'u',
  ṵ: 'u',
  Ʉ: 'u',
  ʉ: 'u',
  Ṽ: 'v',
  ṽ: 'v',
  Ṿ: 'v',
  ṿ: 'v',
  Ʋ: 'v',
  ʋ: 'v',
  Ẃ: 'w',
  ẃ: 'w',
  Ẁ: 'w',
  ẁ: 'w',
  Ŵ: 'w',
  ŵ: 'w',
  W: 'w',
  ẘ: 'w',
  Ẅ: 'w',
  ẅ: 'w',
  Ẇ: 'w',
  ẇ: 'w',
  Ẉ: 'w',
  ẉ: 'w',
  Ẍ: 'x',
  ẍ: 'x',
  Ẋ: 'x',
  ẋ: 'x',
  Ý: 'y',
  ý: 'y',
  Ỳ: 'y',
  ỳ: 'y',
  Ŷ: 'y',
  ŷ: 'y',
  Y: 'y',
  ẙ: 'y',
  Ÿ: 'y',
  ÿ: 'y',
  Ỹ: 'y',
  ỹ: 'y',
  Ẏ: 'y',
  ẏ: 'y',
  Ȳ: 'y',
  ȳ: 'y',
  Ỷ: 'y',
  ỷ: 'y',
  Ỵ: 'y',
  ỵ: 'y',
  ʏ: 'y',
  Ɏ: 'y',
  ɏ: 'y',
  Ƴ: 'y',
  ƴ: 'y',
  Ź: 'z',
  ź: 'z',
  Ẑ: 'z',
  ẑ: 'z',
  Ž: 'z',
  ž: 'z',
  Ż: 'z',
  ż: 'z',
  Ẓ: 'z',
  ẓ: 'z',
  Ẕ: 'z',
  ẕ: 'z',
  Ƶ: 'z',
  ƶ: 'z',
  Ȥ: 'z',
  ȥ: 'z',
  ʐ: 'z',
  ʑ: 'z',
  Ⱬ: 'z',
  ⱬ: 'z',
  Ǯ: 'z',
  ǯ: 'z',
  ƺ: 'z',
};

prototype.stripAccents = function (this: string) {
  let ret = '';
  for (let i = 0; i < this.length; i++) {
    ret += _accentMap[this.charAt(i)] || this.charAt(i);
  }
  return ret;
};

prototype.highlight = function (this: string, terms: string | string[]) {
  function _search(source: string, term: string) {
    let folderSource = source.stripAccents().toLowerCase().replace(/[<>]+/g, '');
    let foldedTerm = term.stripAccents().toLowerCase().replace(/[<>]+/g, '');
    let re = new RegExp(foldedTerm, 'g');
    let hints = folderSource.replace(re, `<${foldedTerm}>`);
    let spos = 0;
    let highlighted = '';
    for (let i = 0; i < hints.length; i++) {
      let c = source.charAt(spos);
      let h = hints.charAt(i);
      if (h === '<') {
        highlighted += '<span class="highlight">';
      } else if (h === '>') {
        highlighted += '</span>';
      } else {
        spos += 1;
        highlighted += c;
      }
    }
    return highlighted;
  }
  if (!isArray(terms)) terms = [terms];
  let highlighted: string = this.toString();
  for (let term of terms) {
    highlighted = _search(highlighted, term);
  }
  return highlighted;
};

prototype.ucfirst = function (this: string) {
  if (this.length < 1) return this;
  return this[0].toUpperCase() + this.substring(1).toLowerCase();
};

prototype.compare = function (this: string, to: string) {
  if (this === to) return 0;
  return this < to ? -1 : 1;
};

prototype.canonical = function (this: string) {
  return this.trim().stripAccents().toLowerCase();
};

prototype.countWords = function (this: string) {
  return this.canonical().split(/[^A-Za-z]+/g).length;
};

prototype.icompare = function (this: string, to: string) {
  return this.canonical().localeCompare(to.canonical());
};

prototype.icontains = function (this: string, to: string) {
  return this.canonical().indexOf(to.canonical()) !== -1;
};

prototype.iequals = function (this: string, to: string) {
  return this.icompare(to) === 0;
};

prototype.format = function (this: string, ...tokens: object[]) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let result = this;
  for (let i = 0; i < tokens.length; i++) {
    result = result.replace(`$${i}`, tokens[i].toString());
  }
  return result;
};

prototype.toUnderscore = function (this: string, separator = '_') {
  return (this[0].toLowerCase() + this.substring(1)).replace(/([A-Z])/g, ($1) => separator + $1.toLowerCase());
};

prototype.toKebabCase = function (this: string) {
  return this.toUnderscore('-');
};

prototype.toIdentifierCase = function (this: string) {
  return this[0].toLowerCase() + this.substring(1);
};

prototype.toClassCase = function (this: string) {
  return this[0].toUpperCase() + this.substring(1);
};

prototype.toSnakeCase = function (this: string, separator?: string) {
  separator = separator || '_';
  return (this[0].toLowerCase() + this.substring(1)).replace(/([A-Z])/g, ($1) => separator + $1.toLowerCase());
};

prototype.stripTags = function (this: string) {
  return this.replace(/(<([^>]+)>)/gi, '').replace(/&nbsp;/g, '');
};

prototype.stripExtended = function (this: string) {
  return this.replace(/([^(\x20-\x7F)]|\(|\)|\[|^])/g, '');
};

prototype.utfDecode = function (this: string) {
  let string = '';
  let i = 0;
  let c = 0;
  let c3 = 0;
  let c2 = 0;

  while (i < this.length) {
    c = this.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      c2 = this.charCodeAt(i + 1);
      // eslint-disable-next-line no-bitwise
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = this.charCodeAt(i + 1);
      c3 = this.charCodeAt(i + 2);
      // eslint-disable-next-line no-bitwise
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }

  return string;
};

export function install() {
  for (const name in prototype) {
    monkeyPatch(String.prototype, name, prototype[name]);
  }
}

declare global {
  interface String {
    /**
     * Convert a string from camel to snake case  (e.g. thisTest to this_test)
     */
    toCamelCase(): string;
    stripAccents(): string;
    highlight(search: string | string[]): string;
    ucfirst(): string;
    compare(to: string): number;

    /**
     * return a lower case, accent free, copy of the string.
     */
    canonical(): string;

    countWords(): number;

    /**
     * Compare two strings ignoring case and accents.
     *
     * @param to a string to compare to
     * @return 0 if equals, 1 if greater, -1 is lower.
     */
    icompare(to: string): number;
    icontains(to: string): boolean;
    iequals(to: string): boolean;
    format(...tokens: object[]): string;

    /**
     * Convert a string from camel to kebab case (e.g. thisTest to this-test)
     *
     * @return {string} converted value
     */
    toUnderscore(separator?: string): string;

    /**
     * Convert a string from camel to identifier case (e.g. thisTest to thisTest)
     *
     * @return {string} converted value
     */
    toKebabCase(): string;

    /**
     * Convert a string from camel to class case  (e.g. thisTest to ThisTest)
     *
     * @return {string} converted value
     */
    toIdentifierCase(): string;

    /**
     * Convert a string from camel to snake case  (e.g. thisTest to this_test)
     *
     * @return {string} converted value
     */
    toClassCase(): string;
    toSnakeCase(separator?: string): string;
    stripTags(): string;
    stripExtended(): string;
    utfDecode(): string;
  }
}
