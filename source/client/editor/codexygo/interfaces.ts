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
  | 'limitationTextFr'
  | 'limitationTextEn'
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

export type TCodexYgoCardTableVectorIndexes =
  | 'nameSearchVector'
  | 'descriptionSearchVector'
  | 'pendEffectSearchVector'
  | 'limitationTextSearchVector';

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
    limitationTextFr: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardTranslation['limitationText']>;
    limitationTextEn: ITableIndexDefinition<ICodexYgoCardEntity, ICodexYgoCardTranslation['limitationText']>;
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
    limitationTextSearchVector: ITableVectorIndexDefinition<ICodexYgoCardEntity>;
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

export type TCodexYgoCardRuleFormat = 'all' | 'master' | 'rush';

export type TCodexYgoCardType = 'monster' | 'spell' | 'trap' | 'skill';

export type TCodexYgoMonsterCardTypeFr =
  | 'Normal'
  | 'Effet'
  | 'Rituel'
  | 'Fusion'
  | 'Synchro'
  | 'Xyz'
  | 'Pendule'
  | 'Lien'
  | 'Toon'
  | 'Spirit'
  | 'Union'
  | 'Gémeau'
  | 'Syntoniseur'
  | 'Flip'
  | 'Maximum';

export type TCodexYgoMonsterCardTypeEn =
  | 'Normal'
  | 'Effect'
  | 'Ritual'
  | 'Fusion'
  | 'Synchro'
  | 'Xyz'
  | 'Pendulum'
  | 'Link'
  | 'Toon'
  | 'Spirit'
  | 'Union'
  | 'Gemini'
  | 'Tuner'
  | 'Flip'
  | 'Maximum';

export type TCodexYgoMonsterTypeFr =
  | 'Magicien'
  | 'Dragon'
  | 'Zombie'
  | 'Guerrier'
  | 'Bête-Guerrier'
  | 'Bête'
  | 'Bête Ailée'
  | 'Démon'
  | 'Elfe'
  | 'Insecte'
  | 'Dinosaure'
  | 'Reptile'
  | 'Poisson'
  | 'Serpent de Mer'
  | 'Aqua'
  | 'Pyro'
  | 'Tonnerre'
  | 'Rocher'
  | 'Plante'
  | 'Machine'
  | 'Psychique'
  | 'Bête Divine'
  | 'Dieu Créateur'
  | 'Wyrm'
  | 'Cyberse'
  | 'Illusion'
  | 'Cyborg'
  | 'Chevalier Magique'
  | 'Grand Dragon'
  | 'Psychique Oméga'
  | 'Guerrier Céleste'
  | 'Galaxie';

export type TCodexYgoMonsterTypeEn =
  | 'Spellcaster'
  | 'Dragon'
  | 'Zombie'
  | 'Warrior'
  | 'Beast-Warrior'
  | 'Beast'
  | 'Winged Beast'
  | 'Fiend'
  | 'Fairy'
  | 'Insect'
  | 'Dinosaur'
  | 'Reptile'
  | 'Fish'
  | 'Sea Serpent'
  | 'Aqua'
  | 'Pyro'
  | 'Thunder'
  | 'Rock'
  | 'Plant'
  | 'Machine'
  | 'Psychic'
  | 'Divine-Beast'
  | 'Creator God'
  | 'Wyrm'
  | 'Cyberse'
  | 'Illusion'
  | 'Cyborg'
  | 'Magical Knight'
  | 'High Dragon'
  | 'Omega Psychic'
  | 'Celestial Warrior'
  | 'Galaxy';

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

  limitationTextsFr?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'limitationTextFr',
    TCodexYgoCardTableIndexes
  >;
  limitationTextsEn?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'limitationTextEn',
    TCodexYgoCardTableIndexes
  >;

  /** Match cards that have at least one of these Card Types */
  cardTypesAny?: TCodexYgoCardType[];

  /** Match cards that have at least one of these Monster Card Types in french */
  monsterCardTypesFrAny?: TCodexYgoMonsterCardTypeFr[];
  /** Match cards that have all of these Monster Card Types in french */
  monsterCardTypesFrAll?: TCodexYgoMonsterCardTypeFr[];

  /** Match cards that have at least one of these Monster Card Types in english */
  monsterCardTypesEnAny?: TCodexYgoMonsterCardTypeEn[];
  /** Match cards that have all of these Monster Card Types in english */
  monsterCardTypesEnAll?: TCodexYgoMonsterCardTypeEn[];

  /** Match cards that have at least one of these Monster Types in french */
  monsterTypesFrAny?: TCodexYgoMonsterTypeFr[];
  /** Match cards that have all of these Monster Types in french */
  monsterTypesFrAll?: TCodexYgoMonsterTypeFr[];

  /** Match cards that have at least one of these Monster Types in english */
  monsterTypesEnAny?: TCodexYgoMonsterTypeEn[];
  /** Match cards that have all of these Monster Types in english */
  monsterTypesEnAll?: TCodexYgoMonsterTypeEn[];

  /** Match cards that have at least one of these abilities in french */
  abilitiesFrAny?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'abilitiesFr',
    TCodexYgoCardTableIndexes
  >;
  /** Match cards that have all of these abilities in french */
  abilitiesFrAll?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'abilitiesFr',
    TCodexYgoCardTableIndexes
  >;

  /** Match cards that have at least one of these abilities in english */
  abilitiesEnAny?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'abilitiesEn',
    TCodexYgoCardTableIndexes
  >;
  /** Match cards that have all of these abilities in english */
  abilitiesEnAll?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'abilitiesEn',
    TCodexYgoCardTableIndexes
  >;

  /** Match cards that have at least one of these frames */
  framesAny?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'frame', TCodexYgoCardTableIndexes>[];
  /** Match cards that have all of these frames */
  framesAll?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'frame', TCodexYgoCardTableIndexes>[];

  /** Match cards that have any of these spell/trap types */
  stTypesAny?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'stType', TCodexYgoCardTableIndexes>[];

  /** Match cards that have any of these attributes */
  attributesAny?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'attribute',
    TCodexYgoCardTableIndexes
  >[];

  /** Match cards that have any of these levels */
  levelsAny?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'level', TCodexYgoCardTableIndexes>[];

  /** Match cards that have any of these ATK max values */
  atkMaxsAny?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'atkMax', TCodexYgoCardTableIndexes>[];

  /** Match cards that have any of these ATK values */
  atksAny?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'atk', TCodexYgoCardTableIndexes>[];

  /** Match cards that have any of these DEF values */
  defsAny?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'def', TCodexYgoCardTableIndexes>[];

  /** Match cards that have any of these scales */
  scalesAny?: TTableIndexReturnType<ICodexYgoCardEntity, ICodexYgoCardTable, 'scale', TCodexYgoCardTableIndexes>[];

  /** Match cards that have at least one of these link arrows */
  linkArrowsAny?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'linkArrows',
    TCodexYgoCardTableIndexes
  >;
  /** Match cards that have all of these link arrows */
  linkArrowsAll?: TTableIndexReturnType<
    ICodexYgoCardEntity,
    ICodexYgoCardTable,
    'linkArrows',
    TCodexYgoCardTableIndexes
  >;

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

/* ------------- Advanced Options ------------ */

export type TCodexYgoCardAdvancedSearchType = 'name' | 'description' | 'pendulumEffect' | 'limitationText';

/**
 * Advanced list options managed by CardListOptions component
 * These represent the filterable properties supported by the advanced filter interface
 */
export interface ICodexYgoCardListAdvancedOptions {
  language: TCodexYgoCardLanguage;
  format: TCodexYgoCardRuleFormat;
  search: string;
  searchType: TCodexYgoCardAdvancedSearchType;
  cardTypesAny?: ICodexYgoCardListOptions['cardTypesAny'];
  attributesAny?: ICodexYgoCardListOptions['attributesAny'];
  stTypesAny?: ICodexYgoCardListOptions['stTypesAny'];
  monsterCardTypesFrAny?: ICodexYgoCardListOptions['monsterCardTypesFrAny'];
  monsterCardTypesFrAll?: ICodexYgoCardListOptions['monsterCardTypesFrAll'];
  monsterTypesFrAny?: ICodexYgoCardListOptions['monsterTypesFrAny'];
  levelsAny?: ICodexYgoCardListOptions['levelsAny'];
  scalesAny?: ICodexYgoCardListOptions['scalesAny'];
  linkArrowsAny?: ICodexYgoCardListOptions['linkArrowsAny'];
  linkArrowsAll?: ICodexYgoCardListOptions['linkArrowsAll'];
  atkMaxsAny?: ICodexYgoCardListOptions['atkMaxsAny'];
  atksAny?: ICodexYgoCardListOptions['atksAny'];
  defsAny?: ICodexYgoCardListOptions['defsAny'];
}
