/* eslint-disable import/export */

import { TForbidTypeChanges, TJSONValue, TLanguageLocale } from 'mn-tools';



// For <title>
export interface IHeadTitleTag {
  tagName: 'title';
  title: string;
}


export type THeadMetaTagName =
  | 'viewport' // Controls the page's responsive layout for different screen sizes
  | 'description' // Short description of the page content for SEO
  | 'keywords' // Keywords for search engines (less relevant today)
  | 'author' // Indicates the author of the page
  | 'theme-color' // Sets the color of the address bar on mobile browsers
  | 'robots' // Tells search engines how to index or follow the page
  | 'google-site-verification' // Google verification token for Search Console
  | 'msvalidate.01' // Bing verification token for Webmaster Tools
  | 'yandex-verification' // Yandex verification token for Webmaster Tools
  | 'twitter:card' // Type of Twitter card for sharing (e.g., summary, large image)
  | 'twitter:site' // Twitter username of the site or publisher
  | 'twitter:title' // Title used when the page is shared on Twitter
  | 'twitter:description' // Description for the Twitter share card
  | 'twitter:image';
 // Image URL displayed in the Twitter share card

export type THeadMetaTagProperty =
  | 'og:type' // Type of content for Open Graph (e.g., website, article)
  | 'og:locale' // Locale of the content (e.g., en_US, fr_FR)
  | 'og:locale:alternate' // Array of other locales the page is available in
  | 'og:site_name' // Name of the website for Open Graph
  | 'og:title' // Title for Open Graph sharing
  | 'og:description' // Description for Open Graph sharing
  | 'og:url' // Canonical URL of the page
  | 'og:image' // URL of the image for Open Graph sharing
  | 'og:image:url' // Identical to og:image
  | 'og:image:secure_url' // An alternate url to use if the webpage requires HTTPS
  | 'og:image:alt' // Alternative text for the Open Graph image
  | 'og:image:type' // MIME type of the image for Open Graph
  | 'og:image:width' // Width of the Open Graph image in pixels
  | 'og:image:height' // Height of the Open Graph image in pixels
  | 'og:video' // URL of the video for Open Graph sharing
  | 'og:video:url' // Identical to og:video
  | 'og:video:secure_url' // An alternate url to use if the webpage requires HTTPS
  | 'og:video:alt' // Alternative text for the Open Graph image
  | 'og:video:type' // MIME type of the video for Open Graph
  | 'og:video:width' // Width of the Open Graph video in pixels
  | 'og:video:height' // Height of the Open Graph video in pixels
  | 'og:audio' // URL of the audio for Open Graph sharing
  | 'og:audio:secure_url' // An alternate url to use if the webpage requires HTTPS
  | 'og:audio:type' // MIME type of the audio for Open Graph
  | 'twitter:card' // (See above, also used in Open Graph context)
  | 'twitter:title' // (See above, also used in Open Graph context)
  | 'twitter:description' // (See above, also used in Open Graph context)
  | 'twitter:image' // (See above, also used in Open Graph context)
  | 'twitter:image:alt' // Alternative text for the Twitter image
  | 'article:published_time' // Publication date of the article in ISO 8601 format
  | 'article:modified_time' // Last modification date of the article in ISO 8601 format
  | 'article:publisher' // URL or profile of the article's publisher
  | 'article:author';
 // URL or profile of the article's author

// For <meta>, we rely on standard `content` + [`name` or `property`]
export interface IHeadMetaTag {
  tagName: 'meta';
  content: string;
  name?: THeadMetaTagName;
  property?: THeadMetaTagProperty;
}


export type THeadLinkTagRel =
  | 'canonical' // Specifies the canonical URL for the current page to avoid duplicate content
  | 'prev' // Indicates the previous page in a paginated series
  | 'next' // Indicates the next page in a paginated series
  | 'apple-touch-icon' // Defines the icon for Apple devices when added to the home screen
  | 'manifest';
 // Points to the PWA manifest file describing the app's properties

// For <link>
export interface IHeadLinkTag {
  tagName: 'link'; // Specifies that this is a <link> element
  rel: THeadLinkTagRel; // Defines the relationship between the current document and the linked resource
  href: string; // URL of the linked resource
}


export type THeadTag = IHeadTitleTag | IHeadMetaTag | IHeadLinkTag;
export interface IRouteRecord {
  static: boolean;
  className?: string;
  methodName: string;
  httpMethod: THttpMethod;
  path: string;
  anonymousAccess?: boolean;
}


export type THttpMethod = 'get' | 'post' | 'put' | 'options' | 'delete' | 'all';


declare global {
  interface IApplicationCookie {
    session_token: string;
  }

  type TApplicationCookie = keyof IApplicationCookie;
}
export type TJobState = 'init' | 'enter' | 'progress' | 'done';


export interface IJob<RESULT = unknown> {
  id: string;
  name: string;
  description: string;
  error?: string;
  result?: RESULT;
  message: string;
  total: number;
  state: TJobState;
  progress: number;
}


export interface IJobResponse<RESULT = unknown> {
  job: IJob<RESULT>;
}


export interface IJobListOptions {
  ids?: IJob['id'][];
  excludeIds?: IJob['id'][];
  states?: IJob['state'][];
  excludeStates?: IJob['state'][];
}


export interface IJobApi {
  list(options?: IJobListOptions): Promise<IJob[]>;
}


declare global {
  interface IAPI {
    job: IJobApi;
  }
}


export interface IFileEntity extends TAbstractEntity {
  /**
   * The real name of the file it is linked to in the file system
   * One real file can be linked to multiple FileEntities
   */
  fileId: string;
  public: boolean;
  fileName?: string;
  fileSize: number;
  mimeType: string;
  /** In pixels */
  width?: number;
  /** In pixels */
  height?: number;
  /** In seconds */
  duration?: number;
}


export type TFileTableIndexes = 'fileId' | 'public';


export interface IFileTable extends IAbstractTable<IFileEntity, TFileTableIndexes> {
  name: 'File';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    fileId: ITableIndexDefinition<IFileEntity, IFileEntity['fileId']>;
    public: ITableIndexDefinition<IFileEntity, IFileEntity['public']>;
  };
}


export interface IFileDerivative<E extends IFileEffect> {
  effects: E[];
}


export interface IFileEffect {
  uuid: string;
  mimeType: string;

  /**
   * Utilisé pour les effets portés par les Entités, notamment pour pouvoir fixer un timestamp lors de la requête.
   * Laisser undefined pour les derivatives définies sur le serveur
   */
  changed?: Date;
}


export interface IFileCropEffect extends IFileEffect {
  uuid: 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
  mimeType: 'image/webp';
  crop: {
    height: number;
    width: number;
    left: number;
    top: number;
  };
  original: { height: number; width: number };
}


export interface IFileResizeEffect extends IFileEffect {
  uuid: 'c3624031-9990-4c63-84c3-b6b6388bd68f';
  mimeType: 'image/webp';
  scale: number;
  height: number;
  width: number;
}


export interface IFileThumbnailEffect extends IFileEffect {
  uuid: '35c0f216-4551-4e09-ba48-20f3332e138f';
  mimeType: 'image/webp';
}


export interface IFileConvertEffect extends IFileEffect {
  uuid: '18c86825-d199-4e32-8214-e872c4bf6318';
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}


export interface IFileApiUploadOptions {
  instance: number;
  oid: number;
}


export interface IFileApiDownloadOptions {
  instance: number;
  oid: number;
  timestamp?: string;
  derivative?: TDerivative;
  /** A stringified IFileEffect[] */
  effects?: string;
}


export interface IFileApiStreamOptions {
  instance: number;
  oid: number;
}


export interface IFileListOptions extends IEntityListOptions<IFileEntity, IFileTable, TFileTableIndexes> {
  fileIds?: TTableIndexReturnType<IFileEntity, IFileTable, 'fileId', TFileTableIndexes>[];
  public?: TTableIndexReturnType<IFileEntity, IFileTable, 'public', TFileTableIndexes>;
}


export interface IFileApiDuplicateOptions {
  originalOid: number;
  /** If empty, same as the original's */
  targetAppInstance?: number;
}


export interface IFileApiCreateFromDataUrlOptions {
  spec?: Partial<IFileEntity>;
  file?: IFileEntity;
  data: string;
}


export interface IFileApiCreateFromExternalUrlOptions {
  url: string;
  spec?: Partial<IFileEntity>;
}


export interface IFileApi {
  count(options?: IFileListOptions): Promise<number>;
  list(options?: IFileListOptions): Promise<IFileEntity[]>;
  listIds(options?: IFileListOptions): Promise<number[]>;
  store(entitySpec: Partial<IFileEntity>): Promise<IFileEntity>;
  trash(options: IEntityTrashOptions): Promise<IFileEntity>;
  duplicate(options: IFileApiDuplicateOptions): Promise<IFileEntity>;
  createFromDataUrl(options: IFileApiCreateFromDataUrlOptions): Promise<IFileEntity>;
  createFromExternalUrl(options: IFileApiCreateFromExternalUrlOptions): Promise<IFileEntity>;
}


declare global {
  interface IAPI {
    file: IFileApi;
  }

  interface IDerivatives {
    default: null;
  }

  type TDerivative = keyof IDerivatives;
}


interface IAbstractEntity {
  oid: number;
  created: Date;
  creator: TAbstractEntity['oid'];
  applicationInstance: TAbstractEntity['oid'];
  changed: Date;
  userChanged: Date;
  deleted?: Date;
  deletedBy?: TAbstractEntity['oid'];
}


export type TAbstractEntity = TForbidTypeChanges<IAbstractEntity, IAbstractEntity>;


/** Generic wrapper to type new entities that have yet to be stored in the DB */
export type TEntityDraft<T extends IAbstractEntity> = Omit<T, keyof IAbstractEntity> & // remove all abstract props
  Partial<TAbstractEntity>;
 // re-add them as optional

export type TAbstractTableStoreQuery = 'insert' | 'update';


export interface ITableIndexDefinition<
  ENTITY extends TAbstractEntity,
  VALUE extends TSQLValue,
  STORE_CONTEXT_DATA extends object = never,
> {
  type: TPostgresType<VALUE>;
  getter: (entity: ENTITY, storeContextData: STORE_CONTEXT_DATA) => VALUE;
}


interface ITableIndexDefinitions<STORE_CONTEXT_DATA extends object = never> {
  oid: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['oid'], STORE_CONTEXT_DATA>;
  created: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['created'], STORE_CONTEXT_DATA>;
  creator: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['creator'], STORE_CONTEXT_DATA>;
  applicationInstance: ITableIndexDefinition<
    TAbstractEntity,
    TAbstractEntity['applicationInstance'],
    STORE_CONTEXT_DATA
  >;
  changed: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['changed'], STORE_CONTEXT_DATA>;
  userChanged: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['userChanged'], STORE_CONTEXT_DATA>;
  deleted: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['deleted'], STORE_CONTEXT_DATA>;
  deletedBy: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['deletedBy'], STORE_CONTEXT_DATA>;
}


export type TTableIndexDefinitions<STORE_CONTEXT_DATA extends object = never> = TForbidTypeChanges<
  ITableIndexDefinitions<STORE_CONTEXT_DATA>,
  ITableIndexDefinitions<STORE_CONTEXT_DATA>
>;


export type TAbstractTableIndexes =
  | 'oid'
  | 'created'
  | 'creator'
  | 'applicationInstance'
  | 'changed'
  | 'userChanged'
  | 'deleted'
  | 'deletedBy';


export type TTableOtherIndexes<
  ENTITY extends TAbstractEntity,
  BASE_INDEXES extends string,
  STORE_CONTEXT_DATA extends object = never,
> = {
  [index in BASE_INDEXES extends TAbstractTableIndexes ? never : BASE_INDEXES]: ITableIndexDefinition<
    ENTITY,
    TSQLValue,
    STORE_CONTEXT_DATA
  >;
};


export type TDatabaseDictionary = 'simple' | 'french' | 'english';


export interface ITableVectorIndexSegment<ENTITY extends TAbstractEntity, STORE_CONTEXT_DATA extends object = never> {
  // Method to get the string that will be vectorized
  getter: (entity: ENTITY, storeContextData: STORE_CONTEXT_DATA) => string;
  // Weight to be applied via setweight (one of 'A', 'B', 'C', 'D')
  weight: 'A' | 'B' | 'C' | 'D';
  // Dictionary to be used when constructing the tsvector.
  dictionary: TDatabaseDictionary;
}


export interface ITableVectorIndexDefinition<
  ENTITY extends TAbstractEntity,
  STORE_CONTEXT_DATA extends object = never,
> {
  // Bits of vectorized strings that will be combined into the vector index column
  segments: [
    ITableVectorIndexSegment<ENTITY, STORE_CONTEXT_DATA>,
    ...ITableVectorIndexSegment<ENTITY, STORE_CONTEXT_DATA>[],
  ];
}


export type TTableVectorIndexDefinitions<
  ENTITY extends TAbstractEntity,
  VECTOR_INDEXES extends string,
  STORE_CONTEXT_DATA extends object = never,
> = {
  [index in VECTOR_INDEXES]: ITableVectorIndexDefinition<ENTITY, STORE_CONTEXT_DATA>;
};


export interface IAbstractTable<
  ENTITY extends TAbstractEntity = TAbstractEntity,
  BASE_INDEXES extends string = never,
  VECTOR_INDEXES extends string = never,
  STORE_CONTEXT_DATA extends object = never,
> {
  query: IQuery<ENTITY, this, BASE_INDEXES>;
  name: string;
  useDataField: boolean;
  indexes: TTableIndexDefinitions<STORE_CONTEXT_DATA> & TTableOtherIndexes<ENTITY, BASE_INDEXES, STORE_CONTEXT_DATA>;
  vectorIndexes: TTableVectorIndexDefinitions<ENTITY, VECTOR_INDEXES, STORE_CONTEXT_DATA>;
  normalize: (entity: Partial<ENTITY>) => void;
  store: (entity: Partial<ENTITY>) => Promise<ENTITY>;
  reindex: (entity: Partial<ENTITY>) => Promise<void>;
  drop: (entity: ENTITY) => Promise<void>;
  restore: (entity: ENTITY) => Promise<void>;
  onBeforeStore: (entity: ENTITY, changedByAdmin: boolean) => Promise<void>;
  onAfterStore: (entity: ENTITY, queryType: TAbstractTableStoreQuery) => Promise<void>;
  onBeforeDrop: (entity: ENTITY) => Promise<void>;
  onBeforeRestore: (entity: ENTITY) => Promise<void>;
}


export interface IPostgresTypeMapping {
  string:
    | 'text'
    | 'varchar'
    | 'char'
    | 'citext' // case-insensitive text
    | 'uuid' // string in UUID format
    | 'json'
    | 'jsonb'
    | 'xml'
    | 'name'; // internal PostgreSQL identifier

  number:
    | 'smallint' // int16 → -32,768 to 32,767
    | 'integer' // int32 → -2,147,483,648 to 2,147,483,647
    | 'bigint' // int64
    | 'real' // float4 (single precision)
    | 'double precision' // float8 (double precision)
    | 'numeric' // arbitrary precision number
    | 'serial' // auto-increment int
    | 'bigserial' // auto-increment bigint
    | 'money'; // monetary format (rarely recommended)

  boolean: 'boolean';

  Date:
    | 'timestamp without time zone'
    | 'timestamp with time zone'
    | 'date'
    | 'time without time zone'
    | 'time with time zone'
    | 'interval'; // used to store a duration

  null: 'text' | 'json' | 'jsonb' | 'unknown'; // 'unknown' can be useful in SQL functions
  undefined: 'text' | 'json' | 'jsonb' | 'unknown';

  stringArray: 'text[]' | 'varchar[]' | 'char[]' | 'citext[]' | 'uuid[]' | 'jsonb[]';

  numberArray: 'smallint[]' | 'integer[]' | 'bigint[]' | 'real[]' | 'double precision[]' | 'numeric[]';

  booleanArray: 'boolean[]';

  DateArray: 'timestamp without time zone[]' | 'timestamp with time zone[]' | 'date[]' | 'interval[]';
}


export type TPostgresBaseType<T> = T extends string
  ? IPostgresTypeMapping['string']
  : T extends number
    ? IPostgresTypeMapping['number']
    : T extends boolean
      ? IPostgresTypeMapping['boolean']
      : T extends Date
        ? IPostgresTypeMapping['Date']
        : T extends null
          ? IPostgresTypeMapping['null']
          : T extends undefined
            ? IPostgresTypeMapping['undefined']
            : never;


export type TPostgresArrayType<T> = T extends (infer U)[]
  ? U extends string
    ? IPostgresTypeMapping['stringArray']
    : U extends number
      ? IPostgresTypeMapping['numberArray']
      : U extends boolean
        ? IPostgresTypeMapping['booleanArray']
        : U extends Date
          ? IPostgresTypeMapping['DateArray']
          : never
  : never;


export type TPostgresType<T> = TPostgresBaseType<T> | TPostgresArrayType<T>;


export type TSQLBaseValue = string | number | boolean | Date | null | undefined;

export type TSQLValue = TSQLBaseValue | TSQLBaseValue[];


export type TValidIndexKeys<
  ENTITY extends TAbstractEntity,
  BASE_INDEXES extends string,
> = keyof (TTableIndexDefinitions & TTableOtherIndexes<ENTITY, BASE_INDEXES>);


export type TTableIndexReturnType<
  ENTITY extends TAbstractEntity,
  TABLE extends IAbstractTable<ENTITY, BASE_INDEXES>,
  INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES> = TValidIndexKeys<ENTITY, never>,
  BASE_INDEXES extends string = never,
> = TABLE['indexes'][INDEX] extends ITableIndexDefinition<ENTITY, infer R> ? R : never;


export type TJoinOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'greaterThanOrEqualTo'
  | 'lowerThan'
  | 'lowerThanOrEqualTo'
  | 'in'
  | 'notIn'
  | 'arrayContains'
  | 'arrayNotContains'
  | 'arrayOverlap'
  | 'arrayNotOverlap'
  | 'like'
  | 'notLike';


export interface IJoinCondition<
  ENTITY extends TAbstractEntity,
  BASE_INDEXES extends string,
  JOIN_ENTITY extends TAbstractEntity,
  JOIN_BASE_INDEXES extends string,
> {
  homeField: TValidIndexKeys<ENTITY, BASE_INDEXES>;
  externalField: TValidIndexKeys<JOIN_ENTITY, JOIN_BASE_INDEXES>;
  operator: TJoinOperator;
}


export type TQueryConditionOperator =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'IN'
  | 'NOT IN'
  | 'LIKE'
  | 'NOT LIKE'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'BETWEEN'
  | '@>'
  | 'NOT @>'
  | '&&'
  | 'NOT &&'
  | '@@ to_tsquery'
  | '@@ to_tsquery tsvector_ranked'
  | '@@ websearch_to_tsquery';


interface IAbstractQueryCondition {
  field: string;
  operator: TQueryConditionOperator;
}


interface IBasicQueryCondition extends IAbstractQueryCondition {
  operator: 'IS NULL' | 'IS NOT NULL';
}


interface IQueryConditionWithValue extends IAbstractQueryCondition {
  value: TSQLValue;
  operator:
    | '='
    | '!='
    | '>'
    | '>='
    | '<'
    | '<='
    | 'IN'
    | 'NOT IN'
    | 'LIKE'
    | 'NOT LIKE'
    | 'BETWEEN'
    | '@>'
    | 'NOT @>'
    | '&&'
    | 'NOT &&'
    | '@@ to_tsquery';
}


interface ITsQueryVectorRankedQueryCondition extends IAbstractQueryCondition {
  operator: '@@ to_tsquery tsvector_ranked';
  value: string;
  dictionaries: TDatabaseDictionary[];
  orderBy?: TEntitySortOrder;
}


interface IWebsearchTsQueryQueryCondition extends IAbstractQueryCondition {
  operator: '@@ websearch_to_tsquery';
  value: string;
  dictionaries: TDatabaseDictionary[];
  orderBy?: TEntitySortOrder;
}


export type TQueryCondition =
  | IBasicQueryCondition
  | IQueryConditionWithValue
  | ITsQueryVectorRankedQueryCondition
  | IWebsearchTsQueryQueryCondition;


export type TQueryJoinType = 'JOIN' | 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL JOIN';


export interface IQueryJoin {
  joinType: TQueryJoinType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  otherQuery: IQuery<any, any, any>;
  joinConditions: string[];
}


/** Build an object type whose keys are the chosen indexes
 *  and whose values are the native SQL type of each index (can be undefined). */
export type TIndexSubset<
  ENTITY extends TAbstractEntity,
  TABLE extends IAbstractTable<ENTITY, BASE_INDEXES>,
  BASE_INDEXES extends string,
  KEYS extends readonly TValidIndexKeys<ENTITY, BASE_INDEXES>[],
> = {
  [K in KEYS[number]]: TTableIndexReturnType<ENTITY, TABLE, K, BASE_INDEXES> | undefined;
};


export interface IQuery<
  ENTITY extends TAbstractEntity,
  TABLE extends IAbstractTable<ENTITY, BASE_INDEXES, VECTOR_INDEXES, STORE_CONTEXT_DATA>,
  BASE_INDEXES extends string = never,
  VECTOR_INDEXES extends string = never,
  STORE_CONTEXT_DATA extends object = never,
> {
  table: TABLE;
  conditions: TQueryCondition[];
  joins: IQueryJoin[];
  fields: string[];
  distinctField?: string;
  orderConditions: string[];
  parameters: TSQLValue[];
  distinct(field: keyof TABLE): this;
  equals<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  notEquals<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  in<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value:
      | TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
      | TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>[]
  ): this;
  notIn<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value:
      | TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
      | TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>[]
  ): this;
  like<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  notLike<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  true(field: TValidIndexKeys<ENTITY, BASE_INDEXES>): this;
  false(field: TValidIndexKeys<ENTITY, BASE_INDEXES>): this;
  null(field: TValidIndexKeys<ENTITY, BASE_INDEXES>): this;
  notNull(field: TValidIndexKeys<ENTITY, BASE_INDEXES>): this;
  greaterThan<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  lowerThan<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  greaterThanOrEqualTo<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  lowerThanOrEqualTo<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  between<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    min: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>,
    max: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  arrayContains<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    values: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  arrayNotContains<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    values: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  arrayOverlap<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    values: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  arrayNoOverlap<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    values: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  textSearch<INDEX extends TValidIndexKeys<ENTITY, BASE_INDEXES>>(
    field: INDEX,
    value: TTableIndexReturnType<ENTITY, TABLE, INDEX, BASE_INDEXES>
  ): this;
  tsvectorFuzzySearch(
    vectorField: keyof TABLE['vectorIndexes'],
    searchString: string,
    dictionaries: TDatabaseDictionary[],
    orderBy?: TEntitySortOrder
  ): this;
  tsvectorStrictSearch(
    vectorField: keyof TABLE['vectorIndexes'],
    searchString: string,
    dictionaries: TDatabaseDictionary[],
    orderBy?: TEntitySortOrder
  ): this;
  /**
   * Groups multiple conditions with the OR operator.
   * The callback receives a temporary Query instance on which you can use typed methods like equals, notEquals, etc.
   */
  orGroup(
    buildTempQueryCallback: (
      q: IQuery<ENTITY, TABLE, BASE_INDEXES, VECTOR_INDEXES, STORE_CONTEXT_DATA>
    ) => IQuery<ENTITY, TABLE, BASE_INDEXES, VECTOR_INDEXES, STORE_CONTEXT_DATA>
  ): this;
  orderBy(field: TValidIndexKeys<ENTITY, BASE_INDEXES>, direction?: TEntitySortOrder): this;
  join<
    JOIN_ENTITY extends TAbstractEntity,
    JOIN_TABLE extends IAbstractTable<JOIN_ENTITY, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    JOIN_BASE_INDEXES extends string = never,
    JOIN_VECTOR_INDEXES extends string = never,
    JOIN_STORE_CONTEXT_DATA extends object = never,
  >(
    otherQuery: IQuery<JOIN_ENTITY, JOIN_TABLE, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    joinConditions: IJoinCondition<ENTITY, BASE_INDEXES, JOIN_ENTITY, JOIN_BASE_INDEXES>[]
  ): this;
  innerJoin<
    JOIN_ENTITY extends TAbstractEntity,
    JOIN_TABLE extends IAbstractTable<JOIN_ENTITY, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    JOIN_BASE_INDEXES extends string = never,
    JOIN_VECTOR_INDEXES extends string = never,
    JOIN_STORE_CONTEXT_DATA extends object = never,
  >(
    otherQuery: IQuery<JOIN_ENTITY, JOIN_TABLE, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    joinConditions: IJoinCondition<ENTITY, BASE_INDEXES, JOIN_ENTITY, JOIN_BASE_INDEXES>[]
  ): this;
  leftJoin<
    JOIN_ENTITY extends TAbstractEntity,
    JOIN_TABLE extends IAbstractTable<JOIN_ENTITY, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    JOIN_BASE_INDEXES extends string = never,
    JOIN_VECTOR_INDEXES extends string = never,
    JOIN_STORE_CONTEXT_DATA extends object = never,
  >(
    otherQuery: IQuery<JOIN_ENTITY, JOIN_TABLE, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    joinConditions: IJoinCondition<ENTITY, BASE_INDEXES, JOIN_ENTITY, JOIN_BASE_INDEXES>[]
  ): this;
  rightJoin<
    JOIN_ENTITY extends TAbstractEntity,
    JOIN_TABLE extends IAbstractTable<JOIN_ENTITY, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    JOIN_BASE_INDEXES extends string = never,
    JOIN_VECTOR_INDEXES extends string = never,
    JOIN_STORE_CONTEXT_DATA extends object = never,
  >(
    otherQuery: IQuery<JOIN_ENTITY, JOIN_TABLE, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    joinConditions: IJoinCondition<ENTITY, BASE_INDEXES, JOIN_ENTITY, JOIN_BASE_INDEXES>[]
  ): this;
  fullJoin<
    JOIN_ENTITY extends TAbstractEntity,
    JOIN_TABLE extends IAbstractTable<JOIN_ENTITY, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    JOIN_BASE_INDEXES extends string = never,
    JOIN_VECTOR_INDEXES extends string = never,
    JOIN_STORE_CONTEXT_DATA extends object = never,
  >(
    otherQuery: IQuery<JOIN_ENTITY, JOIN_TABLE, JOIN_BASE_INDEXES, JOIN_VECTOR_INDEXES, JOIN_STORE_CONTEXT_DATA>,
    joinConditions: IJoinCondition<ENTITY, BASE_INDEXES, JOIN_ENTITY, JOIN_BASE_INDEXES>[]
  ): this;
  exists<
    EXISTS_ENTITY extends TAbstractEntity,
    EXISTS_TABLE extends IAbstractTable<
      EXISTS_ENTITY,
      EXISTS_BASE_INDEXES,
      EXISTS_VECTOR_INDEXES,
      EXISTS_STORE_CONTEXT_DATA
    >,
    EXISTS_BASE_INDEXES extends string = never,
    EXISTS_VECTOR_INDEXES extends string = never,
    EXISTS_STORE_CONTEXT_DATA extends object = never,
  >(
    otherQuery: IQuery<
      EXISTS_ENTITY,
      EXISTS_TABLE,
      EXISTS_BASE_INDEXES,
      EXISTS_VECTOR_INDEXES,
      EXISTS_STORE_CONTEXT_DATA
    >,
    joinConditions: IJoinCondition<ENTITY, BASE_INDEXES, EXISTS_ENTITY, EXISTS_BASE_INDEXES>[]
  ): this;
  notExists<
    EXISTS_ENTITY extends TAbstractEntity,
    EXISTS_TABLE extends IAbstractTable<
      EXISTS_ENTITY,
      EXISTS_BASE_INDEXES,
      EXISTS_VECTOR_INDEXES,
      EXISTS_STORE_CONTEXT_DATA
    >,
    EXISTS_BASE_INDEXES extends string = never,
    EXISTS_VECTOR_INDEXES extends string = never,
    EXISTS_STORE_CONTEXT_DATA extends object = never,
  >(
    otherQuery: IQuery<
      EXISTS_ENTITY,
      EXISTS_TABLE,
      EXISTS_BASE_INDEXES,
      EXISTS_VECTOR_INDEXES,
      EXISTS_STORE_CONTEXT_DATA
    >,
    joinConditions: IJoinCondition<ENTITY, BASE_INDEXES, EXISTS_ENTITY, EXISTS_BASE_INDEXES>[]
  ): this;
  buildConditionClause(condition: TQueryCondition, startIndex: number): string;
  count(): Promise<number>;
  grabIds(options?: IQueryPagerOptions): Promise<number[]>;
  grabId(options?: IQueryPagerOptions): Promise<number | undefined>;
  grab(options?: IQueryPagerOptions): Promise<ENTITY[]>;
  grabOne(options?: IQueryPagerOptions): Promise<ENTITY | undefined>;
  grabFields<const F extends readonly TValidIndexKeys<ENTITY, BASE_INDEXES>[]>(
    fields: [...F],
    options?: IQueryPagerOptions
  ): Promise<TIndexSubset<ENTITY, TABLE, BASE_INDEXES, F>[]>;
  grabDataKeys<K extends keyof ENTITY>(keys: [...K[]], options?: IQueryPagerOptions): Promise<Pick<ENTITY, K>[]>;
}


export type TEntitySortOrder = 'asc' | 'desc';


export interface IEntityListSortOption<ENTITY extends TAbstractEntity, BASE_INDEXES extends string> {
  field: TValidIndexKeys<ENTITY, BASE_INDEXES>;
  order: TEntitySortOrder;
}


export interface IQuerySearchVectorOptions<
  ENTITY extends TAbstractEntity,
  TABLE extends IAbstractTable<ENTITY, BASE_INDEXES, VECTOR_INDEXES, STORE_CONTEXT_DATA>,
  BASE_INDEXES extends string = never,
  VECTOR_INDEXES extends string = never,
  STORE_CONTEXT_DATA extends object = never,
> {
  field: keyof TABLE['vectorIndexes'];
  search: string;
  dictionaries: TDatabaseDictionary[];
  searchMode: 'strict' | 'fuzzy';
  orderBy?: TEntitySortOrder;
}


export interface IQueryPagerOptions {
  from: number;
  count: number;
}


export interface IEntityListOptions<
  ENTITY extends TAbstractEntity,
  TABLE extends IAbstractTable<ENTITY, BASE_INDEXES, VECTOR_INDEXES, STORE_CONTEXT_DATA>,
  BASE_INDEXES extends string = never,
  VECTOR_INDEXES extends string = never,
  STORE_CONTEXT_DATA extends object = never,
> {
  sort?: IEntityListSortOption<ENTITY, BASE_INDEXES>[];
  oids?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'oid'>, 'oid'>[];
  excludeOids?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'oid'>, 'oid'>[];
  applicationInstances?: TTableIndexReturnType<
    TAbstractEntity,
    IAbstractTable<TAbstractEntity, 'applicationInstance'>,
    'applicationInstance'
  >[];
  deleted?: boolean;
  creators?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'creator'>, 'creator'>[];
  excludeCreators?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'creator'>, 'creator'>[];
  searchVectors?: IQuerySearchVectorOptions<ENTITY, TABLE, BASE_INDEXES, VECTOR_INDEXES, STORE_CONTEXT_DATA>[];
  pager?: IQueryPagerOptions;
}


export interface IEntityTrashOptions {
  oid: TTableIndexReturnType<IAbstractEntity, IAbstractTable<IAbstractEntity, 'oid'>, 'oid'>;
}


export interface IEntityListAllOptions {}


export interface IEntityIndex {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: TPostgresType<any>;
}

export interface IEntityListResult {
  name: string;
  count?: number;
  indexes: IEntityIndex[];
}


export interface IEntityReindexOptions {
  entityName: string;
}


export interface IEntityApi {
  list(options?: IEntityListAllOptions): Promise<IEntityListResult[]>;
  reindex(options: IEntityReindexOptions): Promise<IJobResponse>;
}


declare global {
  interface IAPI {
    entity: IEntityApi;
  }
}


export interface IBatchCategories {
  tool: 'Outil';
  export: 'Exports';
}


export type TBatchCategory = keyof IBatchCategories;


export interface IBatchInfo {
  description: string;
  name: string;
  commandOnly: boolean;
  parameterDefinitions: IBatchParameterDefinition[];
}


export type TBatchReportFormatter = 'json' | 'graph' | 'table';


export type TBatchReportPart = IBatchGraphReport | IBatchTableReport | IBatchJsonReport | IBatchMarkdownReport;


export type TBatchReport = TBatchReportPart[];


export interface IBatchJsonReport {
  formatter: 'json';
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}


export interface IBatchMarkdownReport {
  formatter: 'markdown';
  title?: string;
  content: string;
}


export interface IBatchTableReport {
  formatter: 'table';
  title?: string;
  headers: (string | { label: string; width?: string })[];
  rows: TJSONValue[][];
}

export type TBatchGraphReportType = 'lines' | 'donnut';


export interface IBatchGraphReport {
  formatter: 'graph';
  title?: string;
  type: TBatchGraphReportType;
}


export type TBatchParameterType = 'json' | 'string' | 'number' | 'boolean' | 'string[]' | 'number[]';

export interface IBatchParameterDefinition {
  name: string;
  type: TBatchParameterType;
  required?: boolean;
  description?: string;
}


export interface IBatchNextOptions {
  systemVersion: string;
}


export interface IBatchListOptions {}


export type TBatchParameter = string | boolean | number | number[] | string[];

export interface IBatchParameters {
  [name: string]: TBatchParameter;
}

export interface IBatchStartOptions {
  name: string;
  parameters?: IBatchParameters;
}


export interface IBatchApi {
  list(options?: IBatchListOptions): Promise<IBatchInfo[]>;
  start(options: IBatchStartOptions): Promise<IJobResponse<TBatchReport | void>>;
}


declare global {
  interface IAPI {
    batch: IBatchApi;
  }
}


export interface IApplicationInstanceEntity extends TAbstractEntity {
  name: string;
  title: string;
}


export type TApplicationInstanceTableIndexes = keyof Omit<IApplicationInstanceEntity, keyof TAbstractEntity>;


export interface IApplicationInstanceTable
  extends IAbstractTable<IApplicationInstanceEntity, TApplicationInstanceTableIndexes> {
  name: 'ApplicationInstance';
  useDataField: false;
  indexes: TTableIndexDefinitions & {
    name: ITableIndexDefinition<IApplicationInstanceEntity, IApplicationInstanceEntity['name']>;
    title: ITableIndexDefinition<IApplicationInstanceEntity, IApplicationInstanceEntity['title']>;
  };
}


export interface IApplicationInstanceListOptions
  extends IEntityListOptions<IApplicationInstanceEntity, IApplicationInstanceTable, TApplicationInstanceTableIndexes> {
  name?: TTableIndexReturnType<
    IApplicationInstanceEntity,
    IApplicationInstanceTable,
    'name',
    TApplicationInstanceTableIndexes
  >;
}


export interface IApplicationInstanceCreateOptions
  extends IEntityListOptions<IApplicationInstanceEntity, IApplicationInstanceTable, TApplicationInstanceTableIndexes> {
  instance: Partial<IApplicationInstanceEntity>;
  administrator: Partial<IMemberEntity>;
}


export interface IApplicationInstanceApi {
  count(options?: IApplicationInstanceListOptions): Promise<number>;
  list(options?: IApplicationInstanceListOptions): Promise<IApplicationInstanceEntity[]>;
  listIds(options?: IApplicationInstanceListOptions): Promise<number[]>;
  store(entitySpec: Partial<IApplicationInstanceEntity>): Promise<IApplicationInstanceEntity>;
  trash(options: IEntityTrashOptions): Promise<IApplicationInstanceEntity>;
  create(options: IApplicationInstanceCreateOptions): Promise<IApplicationInstanceEntity>;
}


declare global {
  interface IAPI {
    applicationInstance: IApplicationInstanceApi;
  }
}


export type TEntityRolesType = keyof IEntityRolesTypes;


export interface IEntityRolesEntity extends TAbstractEntity {
  entityOid: TAbstractEntity['oid'];
  entityType: TEntityRolesType;
  roles: TAbstractEntity['oid'][];
}


export type IEntityRolesTableIndexes = keyof Omit<IEntityRolesEntity, keyof TAbstractEntity>;


export interface IEntityRolesTable extends IAbstractTable<IEntityRolesEntity, IEntityRolesTableIndexes> {
  name: 'EntityRoles';
  useDataField: false;
  indexes: TTableIndexDefinitions & {
    entityType: ITableIndexDefinition<IEntityRolesEntity, IEntityRolesEntity['entityType']>;
    entityOid: ITableIndexDefinition<IEntityRolesEntity, IEntityRolesEntity['entityOid']>;
    roles: ITableIndexDefinition<IEntityRolesEntity, IEntityRolesEntity['roles']>;
  };
}


export interface IEntityRolesListOptions
  extends IEntityListOptions<IEntityRolesEntity, IEntityRolesTable, IEntityRolesTableIndexes> {
  entityType?: TTableIndexReturnType<IEntityRolesEntity, IEntityRolesTable, 'entityType', IEntityRolesTableIndexes>;
  entityOids?: TTableIndexReturnType<IEntityRolesEntity, IEntityRolesTable, 'entityOid', IEntityRolesTableIndexes>[];
}


export interface IEntityRolesApi {
  count(options?: IEntityRolesListOptions): Promise<number>;
  list(options?: IEntityRolesListOptions): Promise<IEntityRolesEntity[]>;
  listIds(options?: IEntityRolesListOptions): Promise<number[]>;
  store(entitySpec: Partial<IEntityRolesEntity>): Promise<IEntityRolesEntity>;
  trash(options: IEntityTrashOptions): Promise<IEntityRolesEntity>;
}


export interface IRoleEntity extends TAbstractEntity {
  machineName: string;
  title: string;
  permissions: TPermission[];
}


export type TRoleTableIndexes = 'machineName';


export interface IRoleTable extends IAbstractTable<IRoleEntity, TRoleTableIndexes> {
  name: 'Role';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    machineName: ITableIndexDefinition<IRoleEntity, IRoleEntity['machineName']>;
  };
}


export interface IRoleListOptions extends IEntityListOptions<IRoleEntity, IRoleTable, TRoleTableIndexes> {}


export interface IRoleApi {
  count(options?: IRoleListOptions): Promise<number>;
  list(options?: IRoleListOptions): Promise<IRoleEntity[]>;
  listIds(options?: IRoleListOptions): Promise<number[]>;
  store(entitySpec: Partial<IRoleEntity>): Promise<IRoleEntity>;
  trash(options: IEntityTrashOptions): Promise<IRoleEntity>;
}


export interface IServicePermission {
  service: string;
  permission: TPermission;
}


export interface IPermissionListOptions {}


export interface IPermissionApi {
  list(options?: IPermissionListOptions): Promise<IServicePermission[]>;
}


declare global {
  interface IAPI {
    role: IRoleApi;
    entityRoles: IEntityRolesApi;
    permission: IPermissionApi;
  }

  interface IEntityRolesTypes {
    Member: null;
  }
}


export type TPushProvider = 'fcm' | 'apn' | 'ws';


export interface IPushServerApiRegisterOptions {
  provider: TPushProvider;
  token: string;
  client: {
    name: string;
    stage: string;
    version: string;
    language: TLanguageLocale;
    userAgent: string;
  };
}


export interface IPushServerApiRegisterResponse {}


export interface IPushServerApi {
  register(options: IPushServerApiRegisterOptions): Promise<IPushServerApiRegisterResponse>;
}


interface IPushMessageRegistredPayload {
  type: 'registered';
  token: string;
}


export interface IPushMessageRegistred extends IPushMessage<IPushMessageRegistredPayload> {}


declare global {
  interface IAPI {
    pushServer: IPushServerApi;
  }
}
export interface IPushMessagePayload {
  type: string;
}


export interface IPushMessage<PAYLOAD extends IPushMessagePayload = IPushMessagePayload> {
  targetIosAppId?: string; // Example : 'com.joerisama.codexygo'
  body?: string;
  nbNotifications?: number;
  payload?: PAYLOAD;
}


interface IPushMessageReleasePayload {
  type: 'release';
  version: string;
}


export interface IPushMessageRelease extends IPushMessage<IPushMessageReleasePayload> {}


export interface IDeviceSpec {
  device: {
    id: string;
    native: boolean;
    platform: string;
    model: string;
    version: string;
    language: TLanguageLocale;
    time: Date;
    timeOffset: number;
    screen: {
      width: number;
      height: number;
      pixelWidth: number;
    };
  };
  client: {
    userAgent: string;
    version: string;
    name: string;
    stage: string;
    language: TLanguageLocale;
  };
}


export interface IMemberEntity extends TAbstractEntity {
  mail: string;
  /** Hashed password, should always be deleted before sending the object over the API */
  password?: string;
  /** Meant only for changing the password, should never be stored */
  clearPassword?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  picture?: number;
  pictureEffects: IFileEffect[];
  language: TLanguageLocale;
  timeZone?: string;
  darkTheme?: boolean;
  tips: { [uuid: string]: boolean };
}


export interface IMemberTableIndexes {
  mail: ITableIndexDefinition<IMemberEntity, IMemberEntity['mail'], IMemberTableStoreContextData>;
}


export type TMemberTableIndexes = keyof IMemberTableIndexes;


export type TMemberTableVectorIndexes = 'searchVector';


export interface IMemberTableStoreContextData {}


export interface IMemberTable
  extends IAbstractTable<IMemberEntity, TMemberTableIndexes, TMemberTableVectorIndexes, IMemberTableStoreContextData> {
  name: 'Member';
  useDataField: true;
  indexes: TTableIndexDefinitions<IMemberTableStoreContextData> & IMemberTableIndexes;
  vectorIndexes: {
    searchVector: ITableVectorIndexDefinition<IMemberEntity, IMemberTableStoreContextData>;
  };
}


export interface IMemberListOptions
  extends IEntityListOptions<
    IMemberEntity,
    IMemberTable,
    TMemberTableIndexes,
    TMemberTableVectorIndexes,
    IMemberTableStoreContextData
  > {
  mails?: TTableIndexReturnType<IMemberEntity, IMemberTable, 'mail', TMemberTableIndexes>[];
  roles?: TTableIndexReturnType<IEntityRolesEntity, IEntityRolesTable, 'roles', IEntityRolesTableIndexes>;
  searchVector?: string;
}


export interface IMemberApiLoginOptions {
  mail: IMemberEntity['mail'];
  password: string;
  instance: IMemberEntity['applicationInstance'];
  device: IDeviceSpec;
}

export interface IMemberAPILoginResponse {
  error?: string;
  member?: IMemberEntity;
  roles?: IRoleEntity['oid'][];
  permissions?: TPermission[];
}


export interface IMemberApiRegisterOptions {
  userName?: IMemberEntity['userName'];
  lastName?: IMemberEntity['lastName'];
  firstName?: IMemberEntity['firstName'];
  darkTheme?: IMemberEntity['darkTheme'];
  mail: IMemberEntity['mail'];
  password: string;
  instance: IMemberEntity['applicationInstance'];
  device: IDeviceSpec;
}


export interface IMemberApiGetInstancesOptions {
  mail: string;
  password: string;
}

export interface IMemberApiGetInstancesResponse {
  instances: { oid: number; title: string }[];
}


export interface IMemberApiCheckMailOptions {
  mail: string;
}

export interface IMemberApiCheckMailResponse {
  exists: boolean;
}


export interface IMemberApiGetPermissionsOptions {
  member: number;
  applicationInstance: number;
}

export interface IMemberApiGetPermissionsResponse {
  roles: IRoleEntity['oid'][];
  permissions: TPermission[];
}


export interface IMemberApiForgotPasswordOptions {
  mail: string;
}

export interface IMemberApiForgotPasswordResponse {
  sent: boolean;
}


export interface IMemberApi {
  count(options?: IMemberListOptions): Promise<number>;
  list(options?: IMemberListOptions): Promise<IMemberEntity[]>;
  listIds(options?: IMemberListOptions): Promise<number[]>;
  store(entitySpec: Partial<IMemberEntity>): Promise<IMemberEntity>;
  trash(options: IEntityTrashOptions): Promise<IMemberEntity>;
  getInstances(options: IMemberApiGetInstancesOptions): Promise<IMemberApiGetInstancesResponse>;
  checkMail(options: IMemberApiCheckMailOptions): Promise<IMemberApiCheckMailResponse>;
  authenticateToken(): Promise<IMemberAPILoginResponse>;
  login(options: IMemberApiLoginOptions): Promise<IMemberAPILoginResponse>;
  register(options: IMemberApiRegisterOptions): Promise<IMemberAPILoginResponse>;
  forgotPassword(options: IMemberApiForgotPasswordOptions): Promise<IMemberApiForgotPasswordResponse>;
  logout(): Promise<void>;
  getPermissions(options: IMemberApiGetPermissionsOptions): Promise<IMemberApiGetPermissionsResponse>;
}


declare global {
  interface IAPI {
    member: IMemberApi;
  }
}


export type TMailStatus = 'sent' | 'new' | 'error';


export interface IBaseMailTemplateVariables {
  language?: TLanguageLocale;
  attachments?: {
    filename: string;
    content: string;
  }[];
}


export interface IMailEntity extends TAbstractEntity {
  domain: string;
  mid: string;
  status: TMailStatus;
  from: string;
  cc?: string;
  recipients: string;
  template: string;
  variables: IBaseMailTemplateVariables;
  lastError?: string;
  links: string[];
}


export type TMailTableIndexes = 'mid' | 'status' | 'recipients';


export interface IMailTable extends IAbstractTable<IMailEntity, TMailTableIndexes> {
  name: 'Mail';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    mid: ITableIndexDefinition<IMailEntity, IMailEntity['mid']>;
    status: ITableIndexDefinition<IMailEntity, IMailEntity['status']>;
    recipients: ITableIndexDefinition<IMailEntity, IMailEntity['recipients']>;
  };
}


export interface IVariableEntity extends TAbstractEntity {
  name: string;
  value: string;
}


export type TVariableTableIndexes = 'name' | 'value';


export interface IVariableTable extends IAbstractTable<IVariableEntity, TVariableTableIndexes> {
  name: 'Variable';
  useDataField: false;
  indexes: TTableIndexDefinitions & {
    name: ITableIndexDefinition<IVariableEntity, IVariableEntity['name']>;
    value: ITableIndexDefinition<IVariableEntity, IVariableEntity['value']>;
  };
}


export interface ISessionEntity extends TAbstractEntity {
  token: string;
  tokenName: TApplicationCookie;
  device: IDeviceSpec;
  foreground: boolean;
  push?: { token: string; provider: TPushProvider; timestamp: Date };
  lastAccess: Date;
  closed?: Date;
}


export type TSessionTableIndexes =
  | 'lastAccess'
  | 'token'
  | 'tokenName'
  | 'pushToken'
  | 'pushProvider'
  | 'pushTimestamp'
  | 'closed';


export interface ISessionTable extends IAbstractTable<ISessionEntity, TSessionTableIndexes> {
  name: 'Session';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    lastAccess: ITableIndexDefinition<ISessionEntity, ISessionEntity['lastAccess']>;
    token: ITableIndexDefinition<ISessionEntity, ISessionEntity['token']>;
    tokenName: ITableIndexDefinition<ISessionEntity, ISessionEntity['tokenName']>;
    pushToken: ITableIndexDefinition<ISessionEntity, string | undefined>;
    pushProvider: ITableIndexDefinition<ISessionEntity, TPushProvider | undefined>;
    pushTimestamp: ITableIndexDefinition<ISessionEntity, Date | undefined>;
    closed: ITableIndexDefinition<ISessionEntity, ISessionEntity['closed']>;
  };
}


export interface ISessionListOptions extends IEntityListOptions<ISessionEntity, ISessionTable, TSessionTableIndexes> {
  token?: TTableIndexReturnType<ISessionEntity, ISessionTable, 'token', TSessionTableIndexes>;
  tokenNames?: TTableIndexReturnType<ISessionEntity, ISessionTable, 'tokenName', TSessionTableIndexes>[];
  closed?: TTableIndexReturnType<ISessionEntity, ISessionTable, 'closed', TSessionTableIndexes>;
}


declare global {
  interface IDerivatives {
    thumbnail: null;
    media: null;
    avatar: null;
    cardCompact: null;
    webp: null;
  }
}


export {};



declare global {
  type TAppGlobalAccessPermission =
    | 'access - all instances'
    | 'access - developper tools'
    | 'access - administration tools';

  type TEntityRolesEntityPermission =
    | 'entity roles entity - count own'
    | 'entity roles entity - count all'
    | 'entity roles entity - list own'
    | 'entity roles entity - list all'
    | 'entity roles entity - create own'
    | 'entity roles entity - update own'
    | 'entity roles entity - update all'
    | 'entity roles entity - trash own'
    | 'entity roles entity - trash all';

  type TRoleEntityPermission =
    | 'role entity - count own'
    | 'role entity - count all'
    | 'role entity - list own'
    | 'role entity - list all'
    | 'role entity - create own'
    | 'role entity - update own'
    | 'role entity - update all'
    | 'role entity - trash own'
    | 'role entity - trash all';

  type TApplicationInstanceEntityPermission =
    | 'application instance entity - count own'
    | 'application instance entity - count all'
    | 'application instance entity - list own'
    | 'application instance entity - list all'
    | 'application instance entity - create own'
    | 'application instance entity - update own'
    | 'application instance entity - update all'
    | 'application instance entity - trash own'
    | 'application instance entity - trash all';

  type TFileEntityPermission =
    | 'file entity - count own'
    | 'file entity - count all'
    | 'file entity - list own'
    | 'file entity - list all'
    | 'file entity - create own'
    | 'file entity - update own'
    | 'file entity - update all'
    | 'file entity - trash own'
    | 'file entity - trash all';

  type TSessionEntityPermission =
    | 'session entity - count own'
    | 'session entity - count all'
    | 'session entity - list own'
    | 'session entity - list all'
    | 'session entity - create own'
    | 'session entity - update own'
    | 'session entity - update all'
    | 'session entity - trash own'
    | 'session entity - trash all';

  type TMemberEntityPermission =
    | 'member entity - count own'
    | 'member entity - count all'
    | 'member entity - list own'
    | 'member entity - list all'
    | 'member entity - create own'
    | 'member entity - update own'
    | 'member entity - update all'
    | 'member entity - trash own'
    | 'member entity - trash all'
    | 'member entity - count self'
    | 'member entity - list self'
    | 'member entity - update self'
    | 'member entity - trash self';

  type TEntityRolesAPIPermission =
    | 'entity roles api - count'
    | 'entity roles api - list'
    | 'entity roles api - list ids'
    | 'entity roles api - store'
    | 'entity roles api - trash';

  type TRoleAPIPermission =
    | 'role api - count'
    | 'role api - list'
    | 'role api - list ids'
    | 'role api - store'
    | 'role api - trash';

  type TPermissionAPIPermission = 'permission api - list';

  type TApplicationInstanceAPIPermission =
    | 'application instance api - count'
    | 'application instance api - list'
    | 'application instance api - list ids'
    | 'application instance api - store'
    | 'application instance api - trash'
    | 'application instance api - create';

  type TFileAPIPermission =
    | 'file api - upload'
    | 'file api - download'
    | 'file api - stream'
    | 'file api - count'
    | 'file api - list'
    | 'file api - list ids'
    | 'file api - store'
    | 'file api - trash'
    | 'file api - duplicate'
    | 'file api - create from data url'
    | 'file api - create from external url';

  type TBatchAPIPermission = 'batch api - list' | 'batch api - start';

  type TEntityAPIPermission = 'entity api - list' | 'entity api - reindex';

  type TJobAPIPermission = 'job api - list';

  type TPushServerAPIPermission = 'push server api - register';

  type TMemberAPIPermission =
    | 'member api - count'
    | 'member api - list'
    | 'member api - list ids'
    | 'member api - store'
    | 'member api - trash'
    | 'member api - get instances'
    | 'member api - check mail'
    | 'member api - authenticate token'
    | 'member api - login'
    | 'member api - register'
    | 'member api - get permissions'
    | 'member api - logout'
    | 'member api - forgot password';

  type TRootAPIPermission = 'root api - get version';

  type TPermission =
    | TAppGlobalAccessPermission
    | TEntityRolesEntityPermission
    | TRoleEntityPermission
    | TApplicationInstanceEntityPermission
    | TFileEntityPermission
    | TSessionEntityPermission
    | TMemberEntityPermission
    | TEntityRolesAPIPermission
    | TRoleAPIPermission
    | TPermissionAPIPermission
    | TApplicationInstanceAPIPermission
    | TFileAPIPermission
    | TBatchAPIPermission
    | TEntityAPIPermission
    | TJobAPIPermission
    | TPushServerAPIPermission
    | TMemberAPIPermission
    | TRootAPIPermission;
}


export {};




