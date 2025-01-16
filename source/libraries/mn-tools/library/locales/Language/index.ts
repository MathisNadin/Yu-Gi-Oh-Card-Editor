let RECORDS = [
  { id: 'aa', iso6392: 'aar', en: 'Afar', fr: 'afar' },
  { id: 'ab', iso6392: 'abk', en: 'Abkhazian', fr: 'abkhaze' },
  { id: 'af', iso6392: 'afr', en: 'Afrikaans', fr: 'afrikaans' },
  { id: 'ak', iso6392: 'aka', en: 'Akan', fr: 'akan' },
  { id: 'sq', iso6392: 'sqi', en: 'Albanian', fr: 'albanais' },
  { id: 'am', iso6392: 'amh', en: 'Amharic', fr: 'amharique' },
  { id: 'ar', iso6392: 'ara', en: 'Arabic', fr: 'arabe' },
  { id: 'an', iso6392: 'arg', en: 'Aragonese', fr: 'aragonais' },
  { id: 'hy', iso6392: 'hye', en: 'Armenian', fr: 'arménien' },
  { id: 'as', iso6392: 'asm', en: 'Assamese', fr: 'assamais' },
  { id: 'av', iso6392: 'ava', en: 'Avaric', fr: 'avar' },
  { id: 'ae', iso6392: 'ave', en: 'Avestan', fr: 'avestique' },
  { id: 'ay', iso6392: 'aym', en: 'Aymara', fr: 'aymara' },
  { id: 'az', iso6392: 'aze', en: 'Azerbaijani', fr: 'azéri' },
  { id: 'ba', iso6392: 'bak', en: 'Bashkir', fr: 'bachkir' },
  { id: 'bm', iso6392: 'bam', en: 'Bambara', fr: 'bambara' },
  { id: 'eu', iso6392: 'eus', en: 'Basque', fr: 'basque' },
  { id: 'be', iso6392: 'bel', en: 'Belarusian', fr: 'biélorusse' },
  { id: 'bn', iso6392: 'ben', en: 'Bengali', fr: 'bengali' },
  { id: 'bh', iso6392: 'bih', en: 'Bihari languages', fr: 'langues biharis' },
  { id: 'bi', iso6392: 'bis', en: 'Bislama', fr: 'bichlamar' },
  { id: 'bo', iso6392: 'bod', en: 'Tibetan', fr: 'tibétain' },
  { id: 'bs', iso6392: 'bos', en: 'Bosnian', fr: 'bosniaque' },
  { id: 'br', iso6392: 'bre', en: 'Breton', fr: 'breton' },
  { id: 'bg', iso6392: 'bul', en: 'Bulgarian', fr: 'bulgare' },
  { id: 'my', iso6392: 'mya', en: 'Burmese', fr: 'birman' },
  { id: 'ca', iso6392: 'cat', en: 'Catalan', fr: 'catalan' },
  { id: 'cs', iso6392: 'ces', en: 'Czech', fr: 'tchèque' },
  { id: 'ch', iso6392: 'cha', en: 'Chamorro', fr: 'chamorro' },
  { id: 'ce', iso6392: 'che', en: 'Chechen', fr: 'tchétchène' },
  { id: 'zh', iso6392: 'zho', en: 'Chinese', fr: 'chinois' },
  { id: 'cu', iso6392: 'chu', en: 'Church Slavic', fr: "slavon d'église" },
  { id: 'cv', iso6392: 'chv', en: 'Chuvash', fr: 'tchouvache' },
  { id: 'kw', iso6392: 'cor', en: 'Cornish', fr: 'cornique' },
  { id: 'co', iso6392: 'cos', en: 'Corsican', fr: 'corse' },
  { id: 'cr', iso6392: 'cre', en: 'Cree', fr: 'cree' },
  { id: 'cy', iso6392: 'cym', en: 'Welsh', fr: 'gallois' },
  { id: 'cs', iso6392: 'ces', en: 'Czech', fr: 'tchèque' },
  { id: 'da', iso6392: 'dan', en: 'Danish', fr: 'danois' },
  { id: 'de', iso6392: 'deu', en: 'German', fr: 'allemand' },
  { id: 'dv', iso6392: 'div', en: 'Divehi', fr: 'maldivien' },
  { id: 'nl', iso6392: 'nld', en: 'Dutch', fr: 'néerlandais' },
  { id: 'dz', iso6392: 'dzo', en: 'Dzongkha', fr: 'dzongkha' },
  { id: 'el', iso6392: 'ell', en: 'Greek, Modern (1453-)', fr: 'grec moderne (après 1453)' },
  { id: 'en', iso6392: 'eng', en: 'English', fr: 'anglais' },
  { id: 'eo', iso6392: 'epo', en: 'Esperanto', fr: 'espéranto' },
  { id: 'et', iso6392: 'est', en: 'Estonian', fr: 'estonien' },
  { id: 'eu', iso6392: 'eus', en: 'Basque', fr: 'basque' },
  { id: 'ee', iso6392: 'ewe', en: 'Ewe', fr: 'éwé' },
  { id: 'fo', iso6392: 'fao', en: 'Faroese', fr: 'féroïen' },
  { id: 'fa', iso6392: 'fas', en: 'Persian', fr: 'persan' },
  { id: 'fj', iso6392: 'fij', en: 'Fijian', fr: 'fidjien' },
  { id: 'fi', iso6392: 'fin', en: 'Finnish', fr: 'finnois' },
  { id: 'fr', iso6392: 'fra', en: 'French', fr: 'français' },
  { id: 'fr', iso6392: 'fra', en: 'French', fr: 'français' },
  { id: 'fy', iso6392: 'fry', en: 'Western Frisian', fr: 'frison occidental' },
  { id: 'ff', iso6392: 'ful', en: 'Fulah', fr: 'peul' },
  { id: 'ka', iso6392: 'kat', en: 'Georgian', fr: 'géorgien' },
  { id: 'de', iso6392: 'deu', en: 'German', fr: 'allemand' },
  { id: 'gd', iso6392: 'gla', en: 'Gaelic', fr: 'gaélique' },
  { id: 'ga', iso6392: 'gle', en: 'Irish', fr: 'irlandais' },
  { id: 'gl', iso6392: 'glg', en: 'Galician', fr: 'galicien' },
  { id: 'gv', iso6392: 'glv', en: 'Manx', fr: 'manx' },
  { id: 'el', iso6392: 'ell', en: 'Greek, Modern (1453-)', fr: 'grec moderne (après 1453)' },
  { id: 'gn', iso6392: 'grn', en: 'Guarani', fr: 'guarani' },
  { id: 'gu', iso6392: 'guj', en: 'Gujarati', fr: 'goudjrati' },
  { id: 'ht', iso6392: 'hat', en: 'Haitian', fr: 'haïtien' },
  { id: 'ha', iso6392: 'hau', en: 'Hausa', fr: 'haoussa' },
  { id: 'he', iso6392: 'heb', en: 'Hebrew', fr: 'hébreu' },
  { id: 'hz', iso6392: 'her', en: 'Herero', fr: 'herero' },
  { id: 'hi', iso6392: 'hin', en: 'Hindi', fr: 'hindi' },
  { id: 'ho', iso6392: 'hmo', en: 'Hiri Motu', fr: 'hiri motu' },
  { id: 'hr', iso6392: 'hrv', en: 'Croatian', fr: 'croate' },
  { id: 'hu', iso6392: 'hun', en: 'Hungarian', fr: 'hongrois' },
  { id: 'hy', iso6392: 'hye', en: 'Armenian', fr: 'arménien' },
  { id: 'ig', iso6392: 'ibo', en: 'Igbo', fr: 'igbo' },
  { id: 'is', iso6392: 'isl', en: 'Icelandic', fr: 'islandais' },
  { id: 'io', iso6392: 'ido', en: 'Ido', fr: 'ido' },
  { id: 'ii', iso6392: 'iii', en: 'Sichuan Yi', fr: 'yi de Sichuan' },
  { id: 'iu', iso6392: 'iku', en: 'Inuktitut', fr: 'inuktitut' },
  { id: 'ie', iso6392: 'ile', en: 'Interlingue', fr: 'interlingue' },
  {
    id: 'ia',
    iso6392: 'ina',
    en: 'Interlingua (International Auxiliary Language Association)',
    fr: 'interlingua (langue auxiliaire internationale)',
  },
  { id: 'id', iso6392: 'ind', en: 'Indonesian', fr: 'indonésien' },
  { id: 'ik', iso6392: 'ipk', en: 'Inupiaq', fr: 'inupiaq' },
  { id: 'is', iso6392: 'isl', en: 'Icelandic', fr: 'islandais' },
  { id: 'it', iso6392: 'ita', en: 'Italian', fr: 'italien' },
  { id: 'jv', iso6392: 'jav', en: 'Javanese', fr: 'javanais' },
  { id: 'ja', iso6392: 'jpn', en: 'Japanese', fr: 'japonais' },
  { id: 'kl', iso6392: 'kal', en: 'Kalaallisut', fr: 'groenlandais' },
  { id: 'kn', iso6392: 'kan', en: 'Kannada', fr: 'kannada' },
  { id: 'ks', iso6392: 'kas', en: 'Kashmiri', fr: 'kashmiri' },
  { id: 'ka', iso6392: 'kat', en: 'Georgian', fr: 'géorgien' },
  { id: 'kr', iso6392: 'kau', en: 'Kanuri', fr: 'kanouri' },
  { id: 'kk', iso6392: 'kaz', en: 'Kazakh', fr: 'kazakh' },
  { id: 'km', iso6392: 'khm', en: 'Central Khmer', fr: 'khmer central' },
  { id: 'ki', iso6392: 'kik', en: 'Kikuyu', fr: 'kikuyu' },
  { id: 'rw', iso6392: 'kin', en: 'Kinyarwanda', fr: 'rwanda' },
  { id: 'ky', iso6392: 'kir', en: 'Kirghiz', fr: 'kirghiz' },
  { id: 'kv', iso6392: 'kom', en: 'Komi', fr: 'kom' },
  { id: 'kg', iso6392: 'kon', en: 'Kongo', fr: 'kongo' },
  { id: 'ko', iso6392: 'kor', en: 'Korean', fr: 'coréen' },
  { id: 'kj', iso6392: 'kua', en: 'Kuanyama', fr: 'kuanyama' },
  { id: 'ku', iso6392: 'kur', en: 'Kurdish', fr: 'kurde' },
  { id: 'lo', iso6392: 'lao', en: 'Lao', fr: 'lao' },
  { id: 'la', iso6392: 'lat', en: 'Latin', fr: 'latin' },
  { id: 'lv', iso6392: 'lav', en: 'Latvian', fr: 'letton' },
  { id: 'li', iso6392: 'lim', en: 'Limburgan', fr: 'limbourgeois' },
  { id: 'ln', iso6392: 'lin', en: 'Lingala', fr: 'lingala' },
  { id: 'lt', iso6392: 'lit', en: 'Lithuanian', fr: 'lituanien' },
  { id: 'lb', iso6392: 'ltz', en: 'Luxembourgish', fr: 'luxembourgeois' },
  { id: 'lu', iso6392: 'lub', en: 'Luba-Katanga', fr: 'luba-katanga' },
  { id: 'lg', iso6392: 'lug', en: 'Ganda', fr: 'ganda' },
  { id: 'mk', iso6392: 'mkd', en: 'Macedonian', fr: 'macédonien' },
  { id: 'mh', iso6392: 'mah', en: 'Marshallese', fr: 'marshall' },
  { id: 'ml', iso6392: 'mal', en: 'Malayalam', fr: 'malayalam' },
  { id: 'mi', iso6392: 'mri', en: 'Maori', fr: 'maori' },
  { id: 'mr', iso6392: 'mar', en: 'Marathi', fr: 'marathe' },
  { id: 'ms', iso6392: 'msa', en: 'Malay', fr: 'malais' },
  { id: 'mk', iso6392: 'mkd', en: 'Macedonian', fr: 'macédonien' },
  { id: 'mg', iso6392: 'mlg', en: 'Malagasy', fr: 'malgache' },
  { id: 'mt', iso6392: 'mlt', en: 'Maltese', fr: 'maltais' },
  { id: 'mn', iso6392: 'mon', en: 'Mongolian', fr: 'mongol' },
  { id: 'mi', iso6392: 'mri', en: 'Maori', fr: 'maori' },
  { id: 'ms', iso6392: 'msa', en: 'Malay', fr: 'malais' },
  { id: 'my', iso6392: 'mya', en: 'Burmese', fr: 'birman' },
  { id: 'na', iso6392: 'nau', en: 'Nauru', fr: 'nauruan' },
  { id: 'nv', iso6392: 'nav', en: 'Navajo', fr: 'navaho' },
  { id: 'nr', iso6392: 'nbl', en: 'Ndebele, South', fr: 'ndébélé du Sud' },
  { id: 'nd', iso6392: 'nde', en: 'Ndebele, North', fr: 'ndébélé du Nord' },
  { id: 'ng', iso6392: 'ndo', en: 'Ndonga', fr: 'ndonga' },
  { id: 'ne', iso6392: 'nep', en: 'Nepali', fr: 'népalais' },
  { id: 'nl', iso6392: 'nld', en: 'Dutch', fr: 'néerlandais' },
  { id: 'nn', iso6392: 'nno', en: 'Norwegian Nynorsk', fr: 'norvégien nynorsk' },
  { id: 'nb', iso6392: 'nob', en: 'Bokmål, Norwegian', fr: 'norvégien bokmål' },
  { id: 'no', iso6392: 'nor', en: 'Norwegian', fr: 'norvégien' },
  { id: 'ny', iso6392: 'nya', en: 'Chichewa', fr: 'chichewa' },
  { id: 'oc', iso6392: 'oci', en: 'Occitan (post 1500)', fr: 'occitan (après 1500)' },
  { id: 'oj', iso6392: 'oji', en: 'Ojibwa', fr: 'ojibwa' },
  { id: 'or', iso6392: 'ori', en: 'Oriya', fr: 'oriya' },
  { id: 'om', iso6392: 'orm', en: 'Oromo', fr: 'galla' },
  { id: 'os', iso6392: 'oss', en: 'Ossetian', fr: 'ossète' },
  { id: 'pa', iso6392: 'pan', en: 'Panjabi', fr: 'pendjabi' },
  { id: 'fa', iso6392: 'fas', en: 'Persian', fr: 'persan' },
  { id: 'pi', iso6392: 'pli', en: 'Pali', fr: 'pali' },
  { id: 'pl', iso6392: 'pol', en: 'Polish', fr: 'polonais' },
  { id: 'pt', iso6392: 'por', en: 'Portuguese', fr: 'portugais' },
  { id: 'ps', iso6392: 'pus', en: 'Pushto', fr: 'pachto' },
  { id: 'qu', iso6392: 'que', en: 'Quechua', fr: 'quechua' },
  { id: 'rm', iso6392: 'roh', en: 'Romansh', fr: 'romanche' },
  { id: 'ro', iso6392: 'ron', en: 'Romanian', fr: 'roumain' },
  { id: 'ro', iso6392: 'ron', en: 'Romanian', fr: 'roumain' },
  { id: 'rn', iso6392: 'run', en: 'Rundi', fr: 'rundi' },
  { id: 'ru', iso6392: 'rus', en: 'Russian', fr: 'russe' },
  { id: 'sg', iso6392: 'sag', en: 'Sango', fr: 'sango' },
  { id: 'sa', iso6392: 'san', en: 'Sanskrit', fr: 'sanskrit' },
  { id: 'si', iso6392: 'sin', en: 'Sinhala', fr: 'singhalais' },
  { id: 'sk', iso6392: 'slk', en: 'Slovak', fr: 'slovaque' },
  { id: 'sk', iso6392: 'slk', en: 'Slovak', fr: 'slovaque' },
  { id: 'sl', iso6392: 'slv', en: 'Slovenian', fr: 'slovène' },
  { id: 'se', iso6392: 'sme', en: 'Northern Sami', fr: 'sami du Nord' },
  { id: 'sm', iso6392: 'smo', en: 'Samoan', fr: 'samoan' },
  { id: 'sn', iso6392: 'sna', en: 'Shona', fr: 'shona' },
  { id: 'sd', iso6392: 'snd', en: 'Sindhi', fr: 'sindhi' },
  { id: 'so', iso6392: 'som', en: 'Somali', fr: 'somali' },
  { id: 'st', iso6392: 'sot', en: 'Sotho, Southern', fr: 'sotho du Sud' },
  { id: 'es', iso6392: 'spa', en: 'Spanish', fr: 'espagnol' },
  { id: 'sq', iso6392: 'sqi', en: 'Albanian', fr: 'albanais' },
  { id: 'sc', iso6392: 'srd', en: 'Sardinian', fr: 'sarde' },
  { id: 'sr', iso6392: 'srp', en: 'Serbian', fr: 'serbe' },
  { id: 'ss', iso6392: 'ssw', en: 'Swati', fr: 'swati' },
  { id: 'su', iso6392: 'sun', en: 'Sundanese', fr: 'soundanais' },
  { id: 'sw', iso6392: 'swa', en: 'Swahili', fr: 'swahili' },
  { id: 'sv', iso6392: 'swe', en: 'Swedish', fr: 'suédois' },
  { id: 'ty', iso6392: 'tah', en: 'Tahitian', fr: 'tahitien' },
  { id: 'ta', iso6392: 'tam', en: 'Tamil', fr: 'tamoul' },
  { id: 'tt', iso6392: 'tat', en: 'Tatar', fr: 'tatar' },
  { id: 'te', iso6392: 'tel', en: 'Telugu', fr: 'télougou' },
  { id: 'tg', iso6392: 'tgk', en: 'Tajik', fr: 'tadjik' },
  { id: 'tl', iso6392: 'tgl', en: 'Tagalog', fr: 'tagalog' },
  { id: 'th', iso6392: 'tha', en: 'Thai', fr: 'thaï' },
  { id: 'bo', iso6392: 'bod', en: 'Tibetan', fr: 'tibétain' },
  { id: 'ti', iso6392: 'tir', en: 'Tigrinya', fr: 'tigrigna' },
  { id: 'to', iso6392: 'ton', en: 'Tonga (Tonga Islands)', fr: 'tongan (Îles Tonga)' },
  { id: 'tn', iso6392: 'tsn', en: 'Tswana', fr: 'tswana' },
  { id: 'ts', iso6392: 'tso', en: 'Tsonga', fr: 'tsonga' },
  { id: 'tk', iso6392: 'tuk', en: 'Turkmen', fr: 'turkmène' },
  { id: 'tr', iso6392: 'tur', en: 'Turkish', fr: 'turc' },
  { id: 'tw', iso6392: 'twi', en: 'Twi', fr: 'twi' },
  { id: 'ug', iso6392: 'uig', en: 'Uighur', fr: 'ouïgour' },
  { id: 'uk', iso6392: 'ukr', en: 'Ukrainian', fr: 'ukrainien' },
  { id: 'ur', iso6392: 'urd', en: 'Urdu', fr: 'ourdou' },
  { id: 'uz', iso6392: 'uzb', en: 'Uzbek', fr: 'ouszbek' },
  { id: 've', iso6392: 'ven', en: 'Venda', fr: 'venda' },
  { id: 'vi', iso6392: 'vie', en: 'Vietnamese', fr: 'vietnamien' },
  { id: 'vo', iso6392: 'vol', en: 'Volapük', fr: 'volapük' },
  { id: 'cy', iso6392: 'cym', en: 'Welsh', fr: 'gallois' },
  { id: 'wa', iso6392: 'wln', en: 'Walloon', fr: 'wallon' },
  { id: 'wo', iso6392: 'wol', en: 'Wolof', fr: 'wolof' },
  { id: 'xh', iso6392: 'xho', en: 'Xhosa', fr: 'xhosa' },
  { id: 'yi', iso6392: 'yid', en: 'Yiddish', fr: 'yiddish' },
  { id: 'yo', iso6392: 'yor', en: 'Yoruba', fr: 'yoruba' },
  { id: 'za', iso6392: 'zha', en: 'Zhuang', fr: 'zhuang' },
  { id: 'zh', iso6392: 'zho', en: 'Chinese', fr: 'chinois' },
  { id: 'zu', iso6392: 'zul', en: 'Zulu', fr: 'zoulou' },
];

interface ILanguageLocale {
  af: null;
  am: null;
  ar_ae: null;
  ar_bh: null;
  ar_dz: null;
  ar_eg: null;
  ar_iq: null;
  ar_jo: null;
  ar_kw: null;
  ar_lb: null;
  ar_ly: null;
  ar_ma: null;
  ar_om: null;
  ar_qa: null;
  ar_sa: null;
  ar_sy: null;
  ar_tn: null;
  ar_ye: null;
  as: null;
  az_az: null;
  be: null;
  bg: null;
  bn: null;
  bo: null;
  bs: null;
  ca: null;
  cs: null;
  cy: null;
  da: null;
  de_at: null;
  de_ch: null;
  de_de: null;
  de_li: null;
  de_lu: null;
  dv: null;
  el: null;
  en_au: null;
  en_bz: null;
  en_ca: null;
  en_cb: null;
  en_gb: null;
  en_ie: null;
  en_in: null;
  en_jm: null;
  en_nz: null;
  en_ph: null;
  en_tt: null;
  en_us: null;
  en_za: null;
  es_ar: null;
  es_bo: null;
  es_cl: null;
  es_co: null;
  es_cr: null;
  es_do: null;
  es_ec: null;
  es_es: null;
  es_gt: null;
  es_hn: null;
  es_mx: null;
  es_ni: null;
  es_pa: null;
  es_pe: null;
  es_pr: null;
  es_py: null;
  es_sv: null;
  es_uy: null;
  es_ve: null;
  et: null;
  eu: null;
  fa: null;
  fi: null;
  fo: null;
  fr_be: null;
  fr_ca: null;
  fr_ch: null;
  fr_fr: null;
  fr_lu: null;
  gd_ie: null;
  gd: null;
  gn: null;
  gu: null;
  he: null;
  hi: null;
  hr: null;
  hu: null;
  hy: null;
  id: null;
  is: null;
  it_ch: null;
  it_it: null;
  ja: null;
  kk: null;
  km: null;
  kn: null;
  ko: null;
  ks: null;
  la: null;
  lo: null;
  lt: null;
  lv: null;
  mi: null;
  mk: null;
  ml: null;
  mn: null;
  mr: null;
  ms_bn: null;
  ms_my: null;
  mt: null;
  my: null;
  ne: null;
  nl_be: null;
  nl_nl: null;
  no_no: null;
  or: null;
  pa: null;
  pl: null;
  pt_br: null;
  pt_pt: null;
  rm: null;
  ro_mo: null;
  ro: null;
  ru_mo: null;
  ru: null;
  sa: null;
  sb: null;
  sd: null;
  si: null;
  sk: null;
  sl: null;
  so: null;
  sq: null;
  sr_sp: null;
  sv_fi: null;
  sv_se: null;
  sw: null;
  ta: null;
  te: null;
  tg: null;
  th: null;
  tk: null;
  tn: null;
  tr: null;
  ts: null;
  tt: null;
  uk: null;
  ur: null;
  uz_uz: null;
  vi: null;
  xh: null;
  yi: null;
  zh_cn: null;
  zh_hk: null;
  zh_mo: null;
  zh_sg: null;
  zh_tw: null;
  zu: null;
}
interface ILanguageISO6391 {
  ab: null;
  ae: null;
  af: null;
  ak: null;
  am: null;
  an: null;
  ar: null;
  as: null;
  av: null;
  ay: null;
  az: null;
  ba: null;
  be: null;
  bg: null;
  bh: null;
  bi: null;
  bm: null;
  bn: null;
  bo: null;
  br: null;
  bs: null;
  ca: null;
  ce: null;
  ch: null;
  co: null;
  cr: null;
  cs: null;
  cu: null;
  cv: null;
  cy: null;
  da: null;
  de: null;
  dv: null;
  dz: null;
  ee: null;
  el: null;
  en: null;
  eo: null;
  es: null;
  et: null;
  eu: null;
  fa: null;
  ff: null;
  fi: null;
  fj: null;
  fo: null;
  fr: null;
  fy: null;
  ga: null;
  gd: null;
  gl: null;
  gn: null;
  gu: null;
  gv: null;
  ha: null;
  he: null;
  hi: null;
  ho: null;
  hr: null;
  ht: null;
  hu: null;
  hy: null;
  hz: null;
  id: null;
  ie: null;
  ig: null;
  ii: null;
  ik: null;
  io: null;
  is: null;
  it: null;
  iu: null;
  ja: null;
  jv: null;
  ka: null;
  kg: null;
  ki: null;
  kj: null;
  kk: null;
  kl: null;
  km: null;
  kn: null;
  ko: null;
  kr: null;
  ks: null;
  ku: null;
  kv: null;
  kw: null;
  ky: null;
  la: null;
  lb: null;
  lg: null;
  li: null;
  ln: null;
  lo: null;
  lt: null;
  lu: null;
  lv: null;
  mg: null;
  mh: null;
  mi: null;
  mk: null;
  ml: null;
  mn: null;
  mr: null;
  ms: null;
  mt: null;
  my: null;
  na: null;
  nb: null;
  nd: null;
  ne: null;
  ng: null;
  nl: null;
  nn: null;
  no: null;
  nr: null;
  nv: null;
  ny: null;
  oc: null;
  oj: null;
  om: null;
  or: null;
  os: null;
  pa: null;
  pi: null;
  pl: null;
  ps: null;
  pt: null;
  qu: null;
  rm: null;
  rn: null;
  ro: null;
  ru: null;
  rw: null;
  sa: null;
  sc: null;
  sd: null;
  se: null;
  sg: null;
  si: null;
  sk: null;
  sl: null;
  sm: null;
  sn: null;
  so: null;
  sq: null;
  sr: null;
  ss: null;
  st: null;
  su: null;
  sv: null;
  sw: null;
  ta: null;
  te: null;
  tg: null;
  th: null;
  ti: null;
  tk: null;
  tl: null;
  tn: null;
  to: null;
  tr: null;
  ts: null;
  tt: null;
  tw: null;
  ty: null;
  ug: null;
  uk: null;
  ur: null;
  uz: null;
  ve: null;
  vi: null;
  vo: null;
  wa: null;
  wo: null;
  xh: null;
  yi: null;
  yo: null;
  za: null;
  zh: null;
  zu: null;
}
interface ILanguageISO6393 {
  aar: null;
  abk: null;
  ave: null;
  afr: null;
  aka: null;
  amh: null;
  arg: null;
  ara: null;
  asm: null;
  ava: null;
  aym: null;
  azb: null;
  bak: null;
  bel: null;
  bjl: null;
  bih: null;
  bis: null;
  bam: null;
  ben: null;
  bod: null;
  bre: null;
  bos: null;
  cat: null;
  che: null;
  cha: null;
  cos: null;
  cre: null;
  ces: null;
  cur: null;
  cvg: null;
  cym: null;
  dan: null;
  deu: null;
  div: null;
  dzo: null;
  ewe: null;
  ell: null;
  eng: null;
  epo: null;
  spa: null;
  ekk: null;
  baq: null;
  fas: null;
  ful: null;
  fin: null;
  fij: null;
  fao: null;
  fra: null;
  fri: null;
  gle: null;
  ghc: null;
  glg: null;
  gnw: null;
  guj: null;
  glv: null;
  hau: null;
  hbo: null;
  hin: null;
  hmo: null;
  hrv: null;
  hat: null;
  hun: null;
  hye: null;
  her: null;
  ind: null;
  ile: null;
  ibo: null;
  nuo: null;
  ipk: null;
  ido: null;
  isl: null;
  ita: null;
  ike: null;
  jpn: null;
  jvn: null;
  kat: null;
  kon: null;
  kik: null;
  kua: null;
  kaz: null;
  kal: null;
  khm: null;
  kan: null;
  kor: null;
  krt: null;
  kas: null;
  kmr: null;
  kom: null;
  cor: null;
  kir: null;
  lat: null;
  ltz: null;
  lug: null;
  lim: null;
  lin: null;
  lso: null;
  lit: null;
  lub: null;
  lvs: null;
  mlg: null;
  mah: null;
  mri: null;
  mkd: null;
  mal: null;
  mon: null;
  mar: null;
  max: null;
  mlt: null;
  mya: null;
  nau: null;
  nob: null;
  nde: null;
  nep: null;
  ndo: null;
  nld: null;
  nno: null;
  nor: null;
  nbl: null;
  nav: null;
  nya: null;
  oci: null;
  ojb: null;
  orm: null;
  ori: null;
  oss: null;
  pan: null;
  pli: null;
  pol: null;
  pst: null;
  por: null;
  qub: null;
  roh: null;
  run: null;
  ron: null;
  rus: null;
  kin: null;
  san: null;
  sdc: null;
  snd: null;
  sia: null;
  snj: null;
  sin: null;
  slk: null;
  slv: null;
  smo: null;
  sna: null;
  som: null;
  sqi: null;
  srp: null;
  ssw: null;
  sot: null;
  sun: null;
  swe: null;
  swa: null;
  tam: null;
  tel: null;
  tgk: null;
  tha: null;
  tir: null;
  tuk: null;
  tgl: null;
  tsn: null;
  ton: null;
  tur: null;
  tso: null;
  tat: null;
  twi: null;
  tah: null;
  uig: null;
  urk: null;
  urd: null;
  uzb: null;
  ven: null;
  vie: null;
  vol: null;
  wln: null;
  wol: null;
  xho: null;
  ydd: null;
  yor: null;
  zha: null;
  zho: null;
  zul: null;
}

export type TLanguageLocale = keyof ILanguageLocale;
export type TLanguageISO6391 = keyof ILanguageISO6391;
export type TLanguage = keyof ILanguageISO6393;

export let languageLocaleList: { id: TLanguageLocale; label: string }[] = [
  { id: 'af', label: 'Afrikaans' },
  { id: 'am', label: 'Amharic' },
  { id: 'ar_ae', label: 'Arabic - United Arab Emirates' },
  { id: 'ar_bh', label: 'Arabic - Bahrain' },
  { id: 'ar_dz', label: 'Arabic - Algeria' },
  { id: 'ar_eg', label: 'Arabic - Egypt' },
  { id: 'ar_iq', label: 'Arabic - Iraq' },
  { id: 'ar_jo', label: 'Arabic - Jordan' },
  { id: 'ar_kw', label: 'Arabic - Kuwait' },
  { id: 'ar_lb', label: 'Arabic - Lebanon' },
  { id: 'ar_ly', label: 'Arabic - Libya' },
  { id: 'ar_ma', label: 'Arabic - Morocco' },
  { id: 'ar_om', label: 'Arabic - Oman' },
  { id: 'ar_qa', label: 'Arabic - Qatar' },
  { id: 'ar_sa', label: 'Arabic - Saudi Arabia' },
  { id: 'ar_sy', label: 'Arabic - Syria' },
  { id: 'ar_tn', label: 'Arabic - Tunisia' },
  { id: 'ar_ye', label: 'Arabic - Yemen' },
  { id: 'as', label: 'Assamese' },
  { id: 'az_az', label: 'Azeri - Cyrillic' },
  { id: 'be', label: 'Belarusian' },
  { id: 'bg', label: 'Bulgarian' },
  { id: 'bn', label: 'Bengali - Bangladesh' },
  { id: 'bo', label: 'Tibetan' },
  { id: 'bs', label: 'Bosnian' },
  { id: 'ca', label: 'Catalan' },
  { id: 'cs', label: 'Czech' },
  { id: 'cy', label: 'Welsh' },
  { id: 'da', label: 'Danish' },
  { id: 'de_at', label: 'German - Austria' },
  { id: 'de_ch', label: 'German - Switzerland' },
  { id: 'de_de', label: 'German - Germany' },
  { id: 'de_li', label: 'German - Liechtenstein' },
  { id: 'de_lu', label: 'German - Luxembourg' },
  { id: 'dv', label: 'Divehi; Dhivehi; Maldivian' },
  { id: 'el', label: 'Greek' },
  { id: 'en_au', label: 'English - Australia' },
  { id: 'en_bz', label: 'English - Belize' },
  { id: 'en_ca', label: 'English - Canada' },
  { id: 'en_cb', label: 'English - Caribbean' },
  { id: 'en_gb', label: 'English - Great Britain' },
  { id: 'en_ie', label: 'English - Ireland' },
  { id: 'en_in', label: 'English - India' },
  { id: 'en_jm', label: 'English - Jamaica' },
  { id: 'en_nz', label: 'English - New Zealand' },
  { id: 'en_ph', label: 'English - Phillippines' },
  { id: 'en_tt', label: 'English - Trinidad' },
  { id: 'en_us', label: 'English - United States' },
  { id: 'en_za', label: 'English - Southern Africa' },
  { id: 'es_ar', label: 'Spanish - Argentina' },
  { id: 'es_bo', label: 'Spanish - Bolivia' },
  { id: 'es_cl', label: 'Spanish - Chile' },
  { id: 'es_co', label: 'Spanish - Colombia' },
  { id: 'es_cr', label: 'Spanish - Costa Rica' },
  { id: 'es_do', label: 'Spanish - Dominican Republic' },
  { id: 'es_ec', label: 'Spanish - Ecuador' },
  { id: 'es_es', label: 'Spanish - Spain (Traditional)' },
  { id: 'es_gt', label: 'Spanish - Guatemala' },
  { id: 'es_hn', label: 'Spanish - Honduras' },
  { id: 'es_mx', label: 'Spanish - Mexico' },
  { id: 'es_ni', label: 'Spanish - Nicaragua' },
  { id: 'es_pa', label: 'Spanish - Panama' },
  { id: 'es_pe', label: 'Spanish - Peru' },
  { id: 'es_pr', label: 'Spanish - Puerto Rico' },
  { id: 'es_py', label: 'Spanish - Paraguay' },
  { id: 'es_sv', label: 'Spanish - El Salvador' },
  { id: 'es_uy', label: 'Spanish - Uruguay' },
  { id: 'es_ve', label: 'Spanish - Venezuela' },
  { id: 'et', label: 'Estonian' },
  { id: 'eu', label: 'Basque' },
  { id: 'fa', label: 'Farsi - Persian' },
  { id: 'fi', label: 'Finnish' },
  { id: 'fo', label: 'Faroese' },
  { id: 'fr_be', label: 'French - Belgium' },
  { id: 'fr_ca', label: 'French - Canada' },
  { id: 'fr_ch', label: 'French - Switzerland' },
  { id: 'fr_fr', label: 'French - France' },
  { id: 'fr_lu', label: 'French - Luxembourg' },
  { id: 'gd', label: 'Gaelic' },
  { id: 'gd_ie', label: 'Gaelic - Ireland' },
  { id: 'gd', label: 'Gaelic - Scotland' },
  { id: 'gn', label: 'Guarani - Paraguay' },
  { id: 'gu', label: 'Gujarati' },
  { id: 'he', label: 'Hebrew' },
  { id: 'hi', label: 'Hindi' },
  { id: 'hr', label: 'Croatian' },
  { id: 'hu', label: 'Hungarian' },
  { id: 'hy', label: 'Armenian' },
  { id: 'id', label: 'Indonesian' },
  { id: 'is', label: 'Icelandic' },
  { id: 'it_ch', label: 'Italian - Switzerland' },
  { id: 'it_it', label: 'Italian - Italy' },
  { id: 'ja', label: 'Japanese' },
  { id: 'kk', label: 'Kazakh' },
  { id: 'km', label: 'Khmer' },
  { id: 'kn', label: 'Kannada' },
  { id: 'ko', label: 'Korean' },
  { id: 'ks', label: 'Kashmiri' },
  { id: 'la', label: 'Latin' },
  { id: 'lo', label: 'Lao' },
  { id: 'lt', label: 'Lithuanian' },
  { id: 'lv', label: 'Latvian' },
  { id: 'mi', label: 'Maori' },
  { id: 'mk', label: 'FYRO Macedonia' },
  { id: 'ml', label: 'Malayalam' },
  { id: 'mn', label: 'Mongolian' },
  { id: 'mr', label: 'Marathi' },
  { id: 'ms_bn', label: 'Malay - Brunei' },
  { id: 'ms_my', label: 'Malay - Malaysia' },
  { id: 'mt', label: 'Maltese' },
  { id: 'my', label: 'Burmese' },
  { id: 'ne', label: 'Nepali' },
  { id: 'nl_be', label: 'Dutch - Belgium' },
  { id: 'nl_nl', label: 'Dutch - Netherlands' },
  { id: 'no_no', label: 'Norwegian - Bokml' },
  { id: 'or', label: 'Oriya' },
  { id: 'pa', label: 'Punjabi' },
  { id: 'pl', label: 'Polish' },
  { id: 'pt_br', label: 'Portuguese - Brazil' },
  { id: 'pt_pt', label: 'Portuguese - Portugal' },
  { id: 'rm', label: 'Raeto-Romance' },
  { id: 'ro', label: 'Romanian' },
  { id: 'ro_mo', label: 'Romanian - Moldova' },
  { id: 'ru', label: 'Russian' },
  { id: 'ru_mo', label: 'Russian - Moldova' },
  { id: 'sa', label: 'Sanskrit' },
  { id: 'sb', label: 'Sorbian' },
  { id: 'sd', label: 'Sindhi' },
  { id: 'si', label: 'Sinhala; Sinhalese' },
  { id: 'sk', label: 'Slovak' },
  { id: 'sl', label: 'Slovenian' },
  { id: 'so', label: 'Somali' },
  { id: 'sq', label: 'Albanian' },
  { id: 'sr_sp', label: 'Serbian - Cyrillic' },
  { id: 'sv_se', label: 'Swedish - Sweden' },
  { id: 'sv_fi', label: 'Swedish - Finland' },
  { id: 'sw', label: 'Swahili' },
  { id: 'ta', label: 'Tamil' },
  { id: 'te', label: 'Telugu' },
  { id: 'tg', label: 'Tajik' },
  { id: 'th', label: 'Thai' },
  { id: 'tk', label: 'Turkmen' },
  { id: 'tn', label: 'Setsuana' },
  { id: 'tr', label: 'Turkish' },
  { id: 'ts', label: 'Tsonga' },
  { id: 'tt', label: 'Tatar' },
  { id: 'uk', label: 'Ukrainian' },
  { id: 'ur', label: 'Urdu' },
  { id: 'uz_uz', label: 'Uzbek - Cyrillic' },
  { id: 'vi', label: 'Vietnamese' },
  { id: 'xh', label: 'Xhosa' },
  { id: 'yi', label: 'Yiddish' },
  { id: 'zh_cn', label: 'Chinese - China' },
  { id: 'zh_hk', label: 'Chinese - Hong Kong SAR' },
  { id: 'zh_mo', label: 'Chinese - Macau SAR' },
  { id: 'zh_sg', label: 'Chinese - Singapore' },
  { id: 'zh_tw', label: 'Chinese - Taiwan' },
  { id: 'zu', label: 'Zulu' },
];
export let languageList: { id: TLanguage; label: string }[] = [
  { id: 'aar', label: 'Afar - Afaraf' },
  { id: 'abk', label: 'Abkhaz - аҧсуа бызшәа, аҧсшәа' },
  { id: 'ave', label: 'Avestan - avesta' },
  { id: 'afr', label: 'Afrikaans - Afrikaans' },
  { id: 'aka', label: 'Akan - Akan' },
  { id: 'amh', label: 'Amharic - አማርኛ' },
  { id: 'arg', label: 'Aragonese - aragonés' },
  { id: 'ara', label: 'Arabic - العربية' },
  { id: 'asm', label: 'Assamese - অসমীয়া' },
  { id: 'ava', label: 'Avaric - авар мацӀ, магӀарул мацӀ' },
  { id: 'aym', label: 'Aymara - aymar aru' },
  { id: 'azb', label: 'Azerbaijani - azərbaycan dili' },
  { id: 'bak', label: 'Bashkir - башҡорт теле' },
  { id: 'bel', label: 'Belarusian - беларуская мова' },
  { id: 'bjl', label: 'Bulgarian - български език' },
  { id: 'bih', label: 'Bihari - भोजपुरी' },
  { id: 'bis', label: 'Bislama - Bislama' },
  { id: 'bam', label: 'Bambara - bamanankan' },
  { id: 'ben', label: 'Bengali, Bangla - বাংলা' },
  { id: 'bod', label: 'Tibetan Standard, Tibetan, Central - བོད་ཡིག' },
  { id: 'bre', label: 'Breton - brezhoneg' },
  { id: 'bos', label: 'Bosnian - bosanski jezik' },
  { id: 'cat', label: 'Catalan - català' },
  { id: 'che', label: 'Chechen - нохчийн мотт' },
  { id: 'cha', label: 'Chamorro - Chamoru' },
  { id: 'cos', label: 'Corsican - corsu, lingua corsa' },
  { id: 'cre', label: 'Cree - ᓀᐦᐃᔭᐍᐏᐣ' },
  { id: 'ces', label: 'Czech - čeština, český jazyk' },
  { id: 'cur', label: 'Old Church Slavonic, Church Slavonic, Old Bulgarian - ѩзыкъ словѣньскъ' },
  { id: 'cvg', label: 'Chuvash - чӑваш чӗлхи' },
  { id: 'cym', label: 'Welsh - Cymraeg' },
  { id: 'dan', label: 'Danish - dansk' },
  { id: 'deu', label: 'German - Deutsch' },
  { id: 'div', label: 'Divehi, Dhivehi, Maldivian - ދިވެހި' },
  { id: 'dzo', label: 'Dzongkha - རྫོང་ཁ' },
  { id: 'ewe', label: 'Ewe - Eʋegbe' },
  { id: 'ell', label: 'Greek (modern) - ελληνικά' },
  { id: 'eng', label: 'English - English' },
  { id: 'epo', label: 'Esperanto - Esperanto' },
  { id: 'spa', label: 'Spanish - Español' },
  { id: 'ekk', label: 'Estonian - eesti, eesti keel' },
  { id: 'baq', label: 'Basque - euskara, euskera' },
  { id: 'fas', label: 'Persian (Farsi) - فارسی' },
  { id: 'ful', label: 'Fula, Fulah, Pulaar, Pular - Fulfulde, Pulaar, Pular' },
  { id: 'fin', label: 'Finnish - suomi, suomen kieli' },
  { id: 'fij', label: 'Fijian - vosa Vakaviti' },
  { id: 'fao', label: 'Faroese - føroyskt' },
  { id: 'fra', label: 'French - Français' },
  { id: 'fri', label: 'Western Frisian - Frysk' },
  { id: 'gle', label: 'Irish - Gaeilge' },
  { id: 'ghc', label: 'Scottish Gaelic, Gaelic - Gàshorthlig' },
  { id: 'glg', label: 'Galician - galego' },
  { id: 'gnw', label: 'Guaraní - Avañeẽ' },
  { id: 'guj', label: 'Gujarati - ગુજરાતી' },
  { id: 'glv', label: 'Manx - Gaelg, Gailck' },
  { id: 'hau', label: 'Hausa - (Hausa) هَوُسَ' },
  { id: 'hbo', label: 'Hebrew (modern) - עברית' },
  { id: 'hin', label: 'Hindi - हिन्दी, हिंदी' },
  { id: 'hmo', label: 'Hiri Motu - Hiri Motu' },
  { id: 'hrv', label: 'Croatian - hrvatski jezik' },
  { id: 'hat', label: 'Haitian, Haitian Creole - Kreyòl ayisyen' },
  { id: 'hun', label: 'Hungarian - magyar' },
  { id: 'hye', label: 'Armenian - Հայերեն' },
  { id: 'her', label: 'Herero - Otjiherero' },
  { id: 'ind', label: 'Indonesian - Bahasa Indonesia' },
  { id: 'ile', label: 'Interlingue - Originally called Occshortental; then Interlingue after WWII' },
  { id: 'ibo', label: 'Igbo - Asụsụ Igbo' },
  { id: 'nuo', label: 'Nuosu - ꆈꌠ꒿ Nuosuhxop' },
  { id: 'ipk', label: 'Inupiaq - Iñupiaq, Iñupiatun' },
  { id: 'ido', label: 'Ido - Ido' },
  { id: 'isl', label: 'Icelandic - Íslenska' },
  { id: 'ita', label: 'Italian - Italiano' },
  { id: 'ike', label: 'Inuktitut - ᐃᓄᒃᑎᑐᑦ' },
  { id: 'jpn', label: 'Japanese - 日本語 (にほんご)' },
  { id: 'jvn', label: 'Javanese - ꦧꦱꦗꦮ, Basa Jawa' },
  { id: 'kat', label: 'Georgian - ქართული' },
  { id: 'kon', label: 'Kongo - Kikongo' },
  { id: 'kik', label: 'Kikuyu, Gikuyu - Gĩkũyũ' },
  { id: 'kua', label: 'Kwanyama, Kuanyama - Kuanyama' },
  { id: 'kaz', label: 'Kazakh - қазақ тілі' },
  { id: 'kal', label: 'Kalaallisut, Greenlandic - kalaallisut, kalaallit oqaasii' },
  { id: 'khm', label: 'Khmer - ខ្មែរ, ខេមរភាសា, ភាសាខ្មែរ' },
  { id: 'kan', label: 'Kannada - ಕನ್ನಡ' },
  { id: 'kor', label: 'Korean - 한국어' },
  { id: 'krt', label: 'Kanuri - Kanuri' },
  { id: 'kas', label: 'Kashmiri - कश्मीरी, كشميري‎' },
  { id: 'kmr', label: 'Kurdish - Kurdî, كوردی‎' },
  { id: 'kom', label: 'Komi - коми кыв' },
  { id: 'cor', label: 'Cornish - Kernewek' },
  { id: 'kir', label: 'Kyrgyz - Кыргызча, Кыргыз тили' },
  { id: 'lat', label: 'Latin - latine, lingua latina' },
  { id: 'ltz', label: 'Luxembourgish, Letzeburgesch - Lëtzebuergesch' },
  { id: 'lug', label: 'Ganda - Luganda' },
  { id: 'lim', label: 'Limburgish, Limburgan, Limburger - Limburgs' },
  { id: 'lin', label: 'Lingala - Lingála' },
  { id: 'lso', label: 'Lao - ພາສາລາວ' },
  { id: 'lit', label: 'Lithuanian - lietuvių kalba' },
  { id: 'lub', label: 'Luba-Katanga - Tshiluba' },
  { id: 'lvs', label: 'Latvian - latviešu valoda' },
  { id: 'mlg', label: 'Malagasy - fiteny malagasy' },
  { id: 'mah', label: 'Marshallese - Kajin M̧ajeļ' },
  { id: 'mri', label: 'Māori - te reo Māori' },
  { id: 'mkd', label: 'Macedonian - македонски јазик' },
  { id: 'mal', label: 'Malayalam - മലയാളം' },
  { id: 'mon', label: 'Mongolian - Монгол хэл' },
  { id: 'mar', label: 'Marathi (Marāṭhī) - मराठी' },
  { id: 'max', label: 'Malay - bahasa Melayu, بهاس ملايو‎' },
  { id: 'mlt', label: 'Maltese - Malti' },
  { id: 'mya', label: 'Burmese - ဗမာစာ' },
  { id: 'nau', label: 'Nauruan - Dorerin Naoero' },
  { id: 'nob', label: 'Norwegian Bokmål - Norsk bokmål' },
  { id: 'nde', label: 'Northern Ndebele - isiNdebele' },
  { id: 'nep', label: 'Nepali - नेपाली' },
  { id: 'ndo', label: 'Ndonga - Owambo' },
  { id: 'nld', label: 'Dutch - Nederlands, Vlaams' },
  { id: 'nno', label: 'Norwegian Nynorsk - Norsk nynorsk' },
  { id: 'nor', label: 'Norwegian - Norsk' },
  { id: 'nbl', label: 'Southern Ndebele - isiNdebele' },
  { id: 'nav', label: 'Navajo, Navaho - Diné bizaad' },
  { id: 'nya', label: 'Chichewa, Chewa, Nyanja - chiCheŵa, chinyanja' },
  { id: 'oci', label: 'Occitan - occitan, lenga dòc' },
  { id: 'ojb', label: 'Ojibwe, Ojibwa - ᐊᓂᔑᓈᐯᒧᐎᓐ' },
  { id: 'orm', label: 'Oromo - Afaan Oromoo' },
  { id: 'ori', label: 'Oriya - ଓଡ଼ିଆ' },
  { id: 'oss', label: 'Ossetian, Ossetic - ирон æвзаг' },
  { id: 'pan', label: 'Punjabi - ਪੰਜਾਬੀ' },
  { id: 'pli', label: 'Pāli - पाऴि' },
  { id: 'pol', label: 'Polish - język polski, polszczyzna' },
  { id: 'pst', label: 'Pashto, Pushto - پښتو' },
  { id: 'por', label: 'Portuguese - Português' },
  { id: 'qub', label: 'Quechua - Runa Simi, Kichwa' },
  { id: 'roh', label: 'Romansh - rumantsch grischun' },
  { id: 'run', label: 'Kirundi - Ikirundi' },
  { id: 'ron', label: 'Romanian - Română' },
  { id: 'rus', label: 'Russian - Русский' },
  { id: 'kin', label: 'Kinyarwanda - Ikinyarwanda' },
  { id: 'san', label: 'Sanskrit (Saṁskṛta) - संस्कृतम्' },
  { id: 'sdc', label: 'Sardinian - sardu' },
  { id: 'snd', label: 'Sindhi - सिन्धी, سنڌي، سندھی‎' },
  { id: 'sia', label: 'Northern Sami - Davvisámegiella' },
  { id: 'snj', label: 'Sango - yângâ tî sängö' },
  { id: 'sin', label: 'Sinhalese, Sinhala - සිංහල' },
  { id: 'slk', label: 'Slovak - slovenčina, slovenský jazyk' },
  { id: 'slv', label: 'Slovene - slovenski jezik, slovenščina' },
  { id: 'smo', label: 'Samoan - gagana faa Samoa' },
  { id: 'sna', label: 'Shona - chiShona' },
  { id: 'som', label: 'Somali - Soomaaliga, af Soomaali' },
  { id: 'sqi', label: 'Albanian - Shqip' },
  { id: 'srp', label: 'Serbian - српски језик' },
  { id: 'ssw', label: 'Swati - SiSwati' },
  { id: 'sot', label: 'Southern Sotho - Sesotho' },
  { id: 'sun', label: 'Sundanese - Basa Sunda' },
  { id: 'swe', label: 'Swedish - svenska' },
  { id: 'swa', label: 'Swahili - Kiswahili' },
  { id: 'tam', label: 'Tamil - தமிழ்' },
  { id: 'tel', label: 'Telugu - తెలుగు' },
  { id: 'tgk', label: 'Tajik - тоҷикӣ, toçikī, تاجیکی‎' },
  { id: 'tha', label: 'Thai - ไทย' },
  { id: 'tir', label: 'Tigrinya - ትግርኛ' },
  { id: 'tuk', label: 'Turkmen - Türkmen, Түркмен' },
  { id: 'tgl', label: 'Tagalog - Wikang Tagalog' },
  { id: 'tsn', label: 'Tswana - Setswana' },
  { id: 'ton', label: 'Tonga (Tonga Islands) - faka Tonga' },
  { id: 'tur', label: 'Turkish - Türkçe' },
  { id: 'tso', label: 'Tsonga - Xitsonga' },
  { id: 'tat', label: 'Tatar - татар теле, tatar tele' },
  { id: 'twi', label: 'Twi - Twi' },
  { id: 'tah', label: 'Tahitian - Reo Tahiti' },
  { id: 'uig', label: 'Uyghur - ئۇيغۇرچە‎, Uyghurche' },
  { id: 'urk', label: 'Ukrainian - Українська' },
  { id: 'urd', label: 'Urdu - اردو' },
  { id: 'uzb', label: 'Uzbek - Oʻzbek, Ўзбек, أۇزبېك‎' },
  { id: 'ven', label: 'Venda - Tshivenḓa' },
  { id: 'vie', label: 'Vietnamese - Tiếng Việt' },
  { id: 'vol', label: 'Volapük - Volapük' },
  { id: 'wln', label: 'Walloon - walon' },
  { id: 'wol', label: 'Wolof - Wollof' },
  { id: 'xho', label: 'Xhosa - isiXhosa' },
  { id: 'ydd', label: 'Yshortdish - ייִדיש' },
  { id: 'yor', label: 'Yoruba - Yorùbá' },
  { id: 'zha', label: 'Zhuang, Chuang - Saɯ cueŋƅ, Saw cuengh' },
  { id: 'zho', label: 'Chinese - 中文' },
  { id: 'zul', label: 'Zulu - isiZul' },
];

languageList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

export function toISO6391(iso6392: string) {
  let record = RECORDS.find((x) => x.iso6392 === iso6392);
  if (!record) throw new Error(`Unable to find ISO639-2 for ${iso6392}`);
  return record.id;
}

export function toISO6392(iso6391: string) {
  if (iso6391.length === 5) iso6391 = iso6391.substring(0, 2);
  let record = RECORDS.find((x) => x.id === iso6391);
  if (!record) throw new Error(`Unable to find ISO639-2 for ${iso6391}`);
  return record.iso6392;
}
