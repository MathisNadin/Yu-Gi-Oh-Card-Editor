import {
  TAbstractEntity,
  IAbstractTable,
  TTableIndexDefinitions,
  ITableIndexDefinition,
  IFileEntity,
  IFileEffect,
  TEntityDraft,
  IEntityListOptions,
  TTableIndexReturnType,
  ITableVectorIndexDefinition,
} from 'api/main';

/* ----------------------- Card Entity ----------------------- */

export type TCodexYgoCardLanguage = 'en_us' | 'fr_fr';

export type TCodexYgoCardFrame =
  | 'normal'
  | 'effect'
  | 'ritual'
  | 'fusion'
  | 'synchro'
  | 'xyz'
  | 'link'
  | 'spell'
  | 'trap'
  | 'token'
  | 'monsterToken'
  | 'skill'
  | 'obelisk'
  | 'slifer'
  | 'ra'
  | 'legendaryDragon';

export type TCodexYgoCardAttribute = 'dark' | 'light' | 'water' | 'fire' | 'earth' | 'wind' | 'divine';

export type TCodexYgoCardStIcon =
  | 'normal'
  | 'ritual'
  | 'quickplay'
  | 'field'
  | 'continuous'
  | 'equip'
  | 'link'
  | 'counter';

export type TCodexYgoCardLinkArrow =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

export type TCodexYgoCardLinkArrows = { [key in TCodexYgoCardLinkArrow]: boolean };

export interface ICodexYgoCardScales {
  left: number;
  right: number;
}

export type TCodexYgoCardRushEffectType = 'effect' | 'continuous' | 'choice';

export type TCodexYgoCardGameFormat = 'tcg' | 'ocg';

export interface ICodexYgoCardTranslation {
  name?: string;
  description?: string;
  pendEffect?: string;
  abilities?: string[];
  skillBack?: string;
  rushOtherEffects?: string;
  rushCondition?: string;
  rushEffect?: string;
  rushChoiceEffects?: string[];
  limitationText?: string;
}

export type TCodexYgoCardTranslations = { [key in TCodexYgoCardLanguage]?: ICodexYgoCardTranslation };

export type TCodexYgoCardErrata = { [key in TCodexYgoCardLanguage]?: ICodexYgoCardTranslation } & {
  [key in TCodexYgoCardGameFormat as `${key}Effective`]?: Date;
};

export interface ICodexYgoCardEntity extends TAbstractEntity {
  public: boolean;
  konamiId?: number;
  yugipediaSlug?: string;
  translations: TCodexYgoCardTranslations;
  errata?: TCodexYgoCardErrata;
  frame: TCodexYgoCardFrame;
  stType?: TCodexYgoCardStIcon;
  attribute?: TCodexYgoCardAttribute;
  level?: number;
  atkMax?: string;
  atk?: string;
  def?: string;
  scales?: ICodexYgoCardScales;
  linkArrows?: TCodexYgoCardLinkArrows;
  image?: IFileEntity['oid'];
  rush?: boolean;
  legend?: boolean;
  rushEffectType?: TCodexYgoCardRushEffectType;
}

export type TCodexYgoCardTableIndexes =
  | 'public'
  | 'konamiId'
  | 'yugipediaSlug'
  | 'nameFr'
  | 'nameEn'
  | 'abilitiesFr'
  | 'abilitiesEn'
  | 'frame'
  | 'stType'
  | 'attribute'
  | 'level'
  | 'atkMax'
  | 'atk'
  | 'def'
  | 'scale'
  | 'linkArrows'
  | 'rush'
  | 'legend';

export type TCodexYgoCardTableVectorIndexes = 'nameSearchVector' | 'descriptionSearchVector' | 'pendEffectSearchVector';

export interface ICodexYgoCardTable
  extends IAbstractTable<ICodexYgoCardEntity, TCodexYgoCardTableIndexes, TCodexYgoCardTableVectorIndexes> {
  name: 'Card';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    public: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['public']>;
    konamiId: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['konamiId']>;
    yugipediaSlug: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['yugipediaSlug']>;
    nameFr: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardTranslation['name']>;
    nameEn: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardTranslation['name']>;
    abilitiesFr: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardTranslation['abilities']>;
    abilitiesEn: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardTranslation['abilities']>;
    frame: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['frame']>;
    stType: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['stType']>;
    attribute: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['attribute']>;
    level: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['level']>;
    atkMax: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['atkMax']>;
    atk: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['atk']>;
    def: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['def']>;
    scale: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardScales['left'] | undefined>;
    linkArrows: ITableIndexDefinition<ICodexYgoCardEntity, TCodexYgoCardLinkArrow[] | undefined>;
    rush: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['rush']>;
    legend: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardEntity['legend']>;
  };
  vectorIndexes: {
    nameSearchVector: ITableVectorIndexDefinition<ICodexYgoCardEntity>;
    descriptionSearchVector: ITableVectorIndexDefinition<ICodexYgoCardEntity>;
    pendEffectSearchVector: ITableVectorIndexDefinition<ICodexYgoCardEntity>;
  };
}

/* ---------------------- Article Entity ---------------------- */

export interface IArticleEntity extends TAbstractEntity {
  title: string;
  teaser: string;
  thumbnail?: IFileEntity['oid'];
  thumbnailEffects: IFileEffect[];
  slug: string;
  publishDate?: Date;
  categories: TAbstractEntity['oid'][];
  tags: string[];
  cards: ICodexYgoCardEntity['oid'][];
  cardRulings: TAbstractEntity['oid'][];
}

export type TArticleTableIndexes = 'slug' | 'publishDate' | 'categories' | 'tags' | 'cards' | 'cardRulings';

export type TArticleTableVectorIndexes = 'searchVector';

export interface IArticleTable
  extends IAbstractTable<IArticleEntity, TArticleTableIndexes, TArticleTableVectorIndexes> {
  name: 'Article';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    slug: ITableIndexDefinition<IArticleEntity, IArticleEntity['slug']>;
    publishDate: ITableIndexDefinition<IArticleEntity, IArticleEntity['publishDate']>;
    categories: ITableIndexDefinition<IArticleEntity, IArticleEntity['categories']>;
    tags: ITableIndexDefinition<IArticleEntity, IArticleEntity['tags']>;
    cards: ITableIndexDefinition<IArticleEntity, IArticleEntity['cards']>;
    cardRulings: ITableIndexDefinition<IArticleEntity, IArticleEntity['cardRulings']>;
  };
  vectorIndexes: {
    searchVector: ITableVectorIndexDefinition<IArticleEntity>;
  };
}

/* ------------------- Content Block Entity ------------------- */

export type TContentBlockCategory = 'content';

export interface IContentBlockEntity extends TAbstractEntity {
  article: number;
  weight: number;
  type: string;
  theme?: string;
}

export type TContentBlockTableIndexes = 'article' | 'weight' | 'type' | 'theme';

export interface IContentBlockTable extends IAbstractTable<IContentBlockEntity, TContentBlockTableIndexes> {
  name: 'ContentBlock';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    article: ITableIndexDefinition<IContentBlockEntity, IContentBlockEntity['article']>;
    weight: ITableIndexDefinition<IContentBlockEntity, IContentBlockEntity['weight']>;
    type: ITableIndexDefinition<IContentBlockEntity, IContentBlockEntity['type']>;
    theme: ITableIndexDefinition<IContentBlockEntity, IContentBlockEntity['theme']>;
  };
}

export type TContentBlockIllustrationDisplayMode = 'small' | 'medium' | 'large';

/**
 * Content Blocks
 */
export interface IContentBlockContentEntity extends IContentBlockEntity {}

// Fake Card
export interface IContentFakeCardContentBlock extends IContentBlockContentEntity {
  type: '81f39442-0004-4e87-ac7f-c8c7b9370d71';
  language: TCodexYgoCardLanguage;
  fakeCard: TEntityDraft<ICodexYgoCardEntity>;
  setId?: string;
  showOtherNames?: boolean;
  jpName?: string;
  note?: string;
}

// Card
export interface IContentCardContentBlock extends IContentBlockContentEntity {
  type: 'a504be26-45d0-4bb9-8649-74d37bc0ef99';
  language: TCodexYgoCardLanguage;
  card?: ICodexYgoCardEntity['oid'];
  overrideImage?: IFileEntity['oid'];
  overrideImageEffects: IFileEffect[];
  setId?: string;
  showOtherNames?: boolean;
  jpName?: string;
  note?: string;
}

/* ------------------------------------------- */

/* ------------------- API ------------------- */

export interface ICodexYgoCardListOptions
  extends IEntityListOptions<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    TCodexYgoCardTableIndexes,
    TCodexYgoCardTableVectorIndexes
  > {
  konamiIds?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'konamiId', TCodexYgoCardTableIndexes>[];
  namesFr?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'nameFr', TCodexYgoCardTableIndexes>[];
  namesEn?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'nameEn', TCodexYgoCardTableIndexes>[];
  abilitiesFr?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'abilitiesFr',
    TCodexYgoCardTableIndexes
  >;
  abilitiesEn?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'abilitiesEn',
    TCodexYgoCardTableIndexes
  >;
  frames?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'frame', TCodexYgoCardTableIndexes>[];
  stTypes?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'stType', TCodexYgoCardTableIndexes>[];
  attributes?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'attribute', TCodexYgoCardTableIndexes>[];
  levels?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'level', TCodexYgoCardTableIndexes>[];
  atkMaxs?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'atkMax', TCodexYgoCardTableIndexes>[];
  atks?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'atk', TCodexYgoCardTableIndexes>[];
  defs?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'def', TCodexYgoCardTableIndexes>[];
  scales?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'scale', TCodexYgoCardTableIndexes>[];
  linkArrows?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'linkArrows', TCodexYgoCardTableIndexes>;
  rush?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'rush', TCodexYgoCardTableIndexes>;
  public?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'public', TCodexYgoCardTableIndexes>;
}

export interface IArticleListOptions
  extends IEntityListOptions<IArticleEntity, IArticleTable, TArticleTableIndexes, TArticleTableVectorIndexes> {
  published?: boolean;
  slugs?: TTableIndexReturnType<IArticleEntity, IArticleTable, 'slug', TArticleTableIndexes>[];
  categories?: TTableIndexReturnType<IArticleEntity, IArticleTable, 'categories', TArticleTableIndexes>;
  tags?: TTableIndexReturnType<IArticleEntity, IArticleTable, 'tags', TArticleTableIndexes>;
  cards?: TTableIndexReturnType<IArticleEntity, IArticleTable, 'cards', TArticleTableIndexes>;
  cardRulings?: TTableIndexReturnType<IArticleEntity, IArticleTable, 'cardRulings', TArticleTableIndexes>;
}

export interface IContentBlockListOptions
  extends IEntityListOptions<IContentBlockEntity, IContentBlockTable, TContentBlockTableIndexes> {
  articles?: TTableIndexReturnType<IContentBlockEntity, IContentBlockTable, 'article', TContentBlockTableIndexes>[];
  types?: TTableIndexReturnType<IContentBlockEntity, IContentBlockTable, 'type', TContentBlockTableIndexes>[];
  themes?: TTableIndexReturnType<IContentBlockEntity, IContentBlockTable, 'theme', TContentBlockTableIndexes>[];
}

/* ------------------------------------------- */
