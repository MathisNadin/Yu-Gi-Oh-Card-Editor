/* eslint-disable import/export */

import { TForbidTypeChanges, TJSONValue, TLanguageLocale } from 'mn-tools';



export interface ICategoryEntity extends TAbstractEntity {
  parent?: ICategoryEntity['oid'];
  active: boolean;
  name: string;
  path: string;
}


export type TCategoryTableIndexes = 'parent' | 'active' | 'path';


export interface ICategoryTable extends IAbstractTable<ICategoryEntity, TCategoryTableIndexes> {
  name: 'Category';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    parent: ITableIndexDefinition<ICategoryEntity, ICategoryEntity['parent']>;
    active: ITableIndexDefinition<ICategoryEntity, ICategoryEntity['active']>;
    path: ITableIndexDefinition<ICategoryEntity, ICategoryEntity['path']>;
  };
}


export interface ICategoryListOptions
  extends IEntityListOptions<ICategoryEntity, ICategoryTable, TCategoryTableIndexes> {
  parents?: TTableIndexReturnType<ICategoryEntity, ICategoryTable, 'parent', TCategoryTableIndexes>[];
  active?: TTableIndexReturnType<ICategoryEntity, ICategoryTable, 'active', TCategoryTableIndexes>;
  paths?: TTableIndexReturnType<ICategoryEntity, ICategoryTable, 'path', TCategoryTableIndexes>[];
}


export interface ICategoryApi {
  count(options?: ICategoryListOptions): Promise<number>;
  list(options?: ICategoryListOptions): Promise<ICategoryEntity[]>;
  store(entity: Partial<ICategoryEntity>): Promise<ICategoryEntity>;
  trash(options: IEntityTrashOptions): Promise<ICategoryEntity>;
}


declare global {
  interface IAPI {
    category: ICategoryApi;
  }
}


export interface IMemberEntity extends TAbstractEntity {
  userName?: string;
}


export interface IMemberTableIndexes {
  userName: ITableIndexDefinition<IMemberEntity, IMemberEntity['userName']>;
}


export interface IMemberTable {}


export interface IMemberListOptions {
  userNames?: string[];
}


export interface IMemberApiCheckUserNameOptions {
  userName: string;
}

export interface IMemberApiCheckUserNameResponse {
  exists: boolean;
}


export interface IMemberApi {
  checkUserName(options: IMemberApiCheckUserNameOptions): Promise<IMemberApiCheckUserNameResponse>;
}


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
  httpMethod: HttpMethod;
  path: string;
  anonymousAccess?: boolean;
}


export type HttpMethod = 'get' | 'post' | 'put' | 'options' | 'delete' | 'all';


declare global {
  interface IApplicationCookie {
    session_token: string;
  }

  type TApplicationCookie = keyof IApplicationCookie;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IJob<RESULT = any> {
  id: string;
  name: string;
  description: string;
  error?: string;
  result?: RESULT;
  message: string;
  total: number;
  state: JobState;
  progress: number;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IJobResponse<RESULT = any> {
  job: IJob<RESULT>;
}


export type JobState = 'init' | 'enter' | 'progress' | 'done';


export interface IJobListOptions {
  id?: string;
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
  fileName: string;
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


export interface IFileApiDownloadOptions {
  instance: number;
  oid: number;
  timestamp?: string;
  derivative?: TDerivative;
  /** A stringified IFileEffect[] */
  effects?: string;
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
}


export interface IFileApiCreateFromExternalUrlResponse {
  fileOid: number;
}


export interface IFileApi {
  count(options?: IFileListOptions): Promise<number>;
  list(options?: IFileListOptions): Promise<IFileEntity[]>;
  store(entitySpec: Partial<IFileEntity>): Promise<IFileEntity>;
  trash(options: IEntityTrashOptions): Promise<IFileEntity>;
  duplicate(options: IFileApiDuplicateOptions): Promise<IFileEntity>;
  createFromDataUrl(options: IFileApiCreateFromDataUrlOptions): Promise<IFileEntity>;
  createFromExternalUrl(options: IFileApiCreateFromExternalUrlOptions): Promise<IFileApiCreateFromExternalUrlResponse>;
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


export interface IExceptionEntity extends TAbstractEntity {
  timestamp: Date;
  source: string;
  terminal: { version: string };
  os: { name: string; version: string };
}


export type TExceptionTableIndexes = 'timestamp' | 'source' | 'version';


export interface IExceptionTable extends IAbstractTable<IExceptionEntity, TExceptionTableIndexes> {
  name: 'Exception';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    timestamp: ITableIndexDefinition<IExceptionEntity, IExceptionEntity['timestamp']>;
    source: ITableIndexDefinition<IExceptionEntity, IExceptionEntity['source']>;
    version: ITableIndexDefinition<IExceptionEntity, number>;
  };
}


export interface IExceptionApi {
  log(entitySpec: Partial<IExceptionEntity>): Promise<void>;
}


declare global {
  interface IAPI {
    exception: IExceptionApi;
  }
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


export interface ITableIndexDefinition<E extends TAbstractEntity, V extends TSQLValue> {
  type: TPostgresType<V>;
  getter: (entity: E) => V;
}


interface ITableIndexDefinitions {
  oid: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['oid']>;
  created: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['created']>;
  creator: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['creator']>;
  applicationInstance: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['applicationInstance']>;
  changed: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['changed']>;
  userChanged: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['userChanged']>;
  deleted: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['deleted']>;
  deletedBy: ITableIndexDefinition<TAbstractEntity, TAbstractEntity['deletedBy']>;
}


export type TTableIndexDefinitions = TForbidTypeChanges<ITableIndexDefinitions, ITableIndexDefinitions>;


export type TAbstractTableIndexes =
  | 'oid'
  | 'created'
  | 'creator'
  | 'applicationInstance'
  | 'changed'
  | 'userChanged'
  | 'deleted'
  | 'deletedBy';


export type TTableOtherIndexes<E extends TAbstractEntity, K extends string> = {
  [index in K extends TAbstractTableIndexes ? never : K]: ITableIndexDefinition<E, TSQLValue>;
};


export type TDatabaseDictionary = 'simple' | 'french' | 'english';


export interface ITableVectorIndexSegment<E extends TAbstractEntity> {
  // Method to get the string that will be vectorized
  getter: (entity: E) => string;
  // Weight to be applied via setweight (one of 'A', 'B', 'C', 'D')
  weight: 'A' | 'B' | 'C' | 'D';
  // Dictionary to be used when constructing the tsvector.
  dictionary: TDatabaseDictionary;
}


export interface ITableVectorIndexDefinition<E extends TAbstractEntity> {
  // Bits of vectorized strings that will be combined into the vector index column
  segments: [ITableVectorIndexSegment<E>, ...ITableVectorIndexSegment<E>[]];
}


export type TTableVectorIndexDefinitions<E extends TAbstractEntity, V extends string> = {
  [index in V]: ITableVectorIndexDefinition<E>;
};


export interface IAbstractTable<
  E extends TAbstractEntity = TAbstractEntity,
  K extends string = never,
  V extends string = never,
> {
  query: IQuery<E, this, K>;
  name: string;
  useDataField: boolean;
  indexes: TTableIndexDefinitions & TTableOtherIndexes<E, K>;
  vectorIndexes: TTableVectorIndexDefinitions<E, V>;
  normalize: (entity: Partial<E>) => void;
  store: (entity: Partial<E>) => Promise<E>;
  reindex: (entity: Partial<E>) => Promise<void>;
  drop: (entity: E) => Promise<void>;
  restore: (entity: E) => Promise<void>;
  onBeforeStore: (entity: E, changedByAdmin: boolean) => Promise<void>;
  onAfterStore: (entity: E) => Promise<void>;
  onBeforeDrop: (entity: E) => Promise<void>;
  onBeforeRestore: (entity: E) => Promise<void>;
}


export interface IPostgresTypeMapping {
  string: 'text' | 'varchar' | 'char';
  number: 'integer' | 'float' | 'double precision' | 'numeric';
  boolean: 'boolean';
  Date: 'timestamp without time zone' | 'date';
  null: 'text'; // Peut-être changé selon le contexte
  undefined: 'text'; // Peut-être changé selon le contexte
  stringArray: 'text[]' | 'varchar[]' | 'char[]';
  numberArray: 'integer[]' | 'float[]' | 'double precision[]' | 'numeric[]';
  booleanArray: 'boolean[]';
  DateArray: 'timestamp[]' | 'date[]';
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


export type TValidIndexKeys<E extends TAbstractEntity, K extends string> = keyof (TTableIndexDefinitions &
  TTableOtherIndexes<E, K>);


export type TTableIndexReturnType<
  E extends TAbstractEntity,
  T extends IAbstractTable<E, K>,
  I extends TValidIndexKeys<E, K> = TValidIndexKeys<E, never>,
  K extends string = never,
> = T['indexes'][I] extends ITableIndexDefinition<E, infer R> ? R : never;


export type TJoinOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'greaterThanOrEqualTo'
  | 'lowerThan'
  | 'lowerThanOrEqualTo'
  | 'in'
  | 'notIn'
  | 'like'
  | 'notLike';


export interface IJoinCondition<
  E extends TAbstractEntity,
  K extends string,
  A extends TAbstractEntity,
  O extends string,
> {
  homeField: TValidIndexKeys<E, K>;
  externalField: TValidIndexKeys<A, O>;
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
  | '&&'
  | 'NOT &&'
  | '@@ to_tsquery'
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
    | '&&'
    | 'NOT &&'
    | '@@ to_tsquery';
}


interface IWebsearchTsQueryQueryCondition extends IAbstractQueryCondition {
  operator: '@@ websearch_to_tsquery';
  value: string;
  dictionaries: TDatabaseDictionary[];
  orderBy?: TEntitySortOrder;
}


export type TQueryCondition = IBasicQueryCondition | IQueryConditionWithValue | IWebsearchTsQueryQueryCondition;


export type TQueryJoinType = 'JOIN' | 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL JOIN';


export interface IQueryJoin {
  joinType: TQueryJoinType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  otherQuery: IQuery<any, any>;
  joinConditions: string[];
}


export interface IQuery<
  E extends TAbstractEntity,
  T extends IAbstractTable<E, K, V>,
  K extends string = never,
  V extends string = never,
> {
  table: T;
  conditions: TQueryCondition[];
  joins: IQueryJoin[];
  fields: string[];
  distinctField?: string;
  orderConditions: string[];
  parameters: TSQLValue[];
  distinct(field: keyof T): this;
  equals<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  notEquals<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  in<I extends TValidIndexKeys<E, K>>(
    field: I,
    value: TTableIndexReturnType<E, T, I, K> | TTableIndexReturnType<E, T, I, K>[]
  ): this;
  notIn<I extends TValidIndexKeys<E, K>>(
    field: I,
    value: TTableIndexReturnType<E, T, I, K> | TTableIndexReturnType<E, T, I, K>[]
  ): this;
  like<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  notLike<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  true(field: TValidIndexKeys<E, K>): this;
  false(field: TValidIndexKeys<E, K>): this;
  null(field: TValidIndexKeys<E, K>): this;
  notNull(field: TValidIndexKeys<E, K>): this;
  greaterThan<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  lowerThan<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  greaterThanOrEqualTo<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  lowerThanOrEqualTo<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  between<I extends TValidIndexKeys<E, K>>(
    field: I,
    min: TTableIndexReturnType<E, T, I, K>,
    max: TTableIndexReturnType<E, T, I, K>
  ): this;
  arrayOverlap<I extends TValidIndexKeys<E, K>>(field: I, values: TTableIndexReturnType<E, T, I, K>): this;
  arrayNoOverlap<I extends TValidIndexKeys<E, K>>(field: I, values: TTableIndexReturnType<E, T, I, K>): this;
  textSearch<I extends TValidIndexKeys<E, K>>(field: I, value: TTableIndexReturnType<E, T, I, K>): this;
  tsvectorSearch(
    vectorField: keyof T['vectorIndexes'],
    searchString: string,
    dictionaries: TDatabaseDictionary[],
    orderBy?: TEntitySortOrder
  ): this;
  orderBy(field: TValidIndexKeys<E, K>, direction?: TEntitySortOrder): this;
  join<A extends TAbstractEntity, J extends IAbstractTable<A, O>, O extends string = never>(
    otherQuery: IQuery<A, J, O>,
    joinConditions: IJoinCondition<E, K, A, O>[]
  ): this;
  innerJoin<A extends TAbstractEntity, J extends IAbstractTable<A, O>, O extends string = never>(
    otherQuery: IQuery<A, J, O>,
    joinConditions: IJoinCondition<E, K, A, O>[]
  ): this;
  leftJoin<A extends TAbstractEntity, J extends IAbstractTable<A, O>, O extends string = never>(
    otherQuery: IQuery<A, J, O>,
    joinConditions: IJoinCondition<E, K, A, O>[]
  ): this;
  rightJoin<A extends TAbstractEntity, J extends IAbstractTable<A, O>, O extends string = never>(
    otherQuery: IQuery<A, J, O>,
    joinConditions: IJoinCondition<E, K, A, O>[]
  ): this;
  fullJoin<A extends TAbstractEntity, J extends IAbstractTable<A, O>, O extends string = never>(
    otherQuery: IQuery<A, J, O>,
    joinConditions: IJoinCondition<E, K, A, O>[]
  ): this;
  buildConditionClause(condition: TQueryCondition, startIndex: number): string;
  count(): Promise<number>;
  grabIds(options?: IQueryPagerOptions): Promise<number[]>;
  grabId(options?: IQueryPagerOptions): Promise<number | undefined>;
  grab(options?: IQueryPagerOptions): Promise<E[]>;
  grabOne(options?: IQueryPagerOptions): Promise<E | undefined>;
}


export type TEntitySortOrder = 'asc' | 'desc';


export interface IEntityListSortOption<E extends TAbstractEntity, K extends string> {
  field: TValidIndexKeys<E, K>;
  order: TEntitySortOrder;
}


export interface IQuerySearchVectorOptions<
  E extends TAbstractEntity,
  T extends IAbstractTable<E, K, V>,
  K extends string = never,
  V extends string = never,
> {
  field: keyof T['vectorIndexes'];
  search: string;
  dictionaries: TDatabaseDictionary[];
  orderBy?: TEntitySortOrder;
}


export interface IQueryPagerOptions {
  from: number;
  count: number;
}


export interface IEntityListOptions<
  E extends TAbstractEntity,
  T extends IAbstractTable<E, K, V>,
  K extends string = never,
  V extends string = never,
> {
  sort?: IEntityListSortOption<E, K>[];
  oids?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'oid'>, 'oid'>[];
  excludeOids?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'oid'>, 'oid'>[];
  deleted?: boolean;
  creator?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'creator'>, 'creator'>;
  searchVectors?: IQuerySearchVectorOptions<E, T, K, V>[];
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
  id: TAbstractEntity['oid'];
  type: TEntityRolesType;
  roles: TAbstractEntity['oid'][];
}


export type IEntityRolesTableIndexes = keyof Omit<IEntityRolesEntity, keyof TAbstractEntity>;


export interface IEntityRolesTable extends IAbstractTable<IEntityRolesEntity, IEntityRolesTableIndexes> {
  name: 'EntityRoles';
  useDataField: false;
  indexes: TTableIndexDefinitions & {
    id: ITableIndexDefinition<IEntityRolesEntity, IEntityRolesEntity['id']>;
    type: ITableIndexDefinition<IEntityRolesEntity, IEntityRolesEntity['type']>;
    roles: ITableIndexDefinition<IEntityRolesEntity, IEntityRolesEntity['roles']>;
  };
}


export interface IEntityRolesListOptions
  extends IEntityListOptions<IEntityRolesEntity, IEntityRolesTable, IEntityRolesTableIndexes> {
  type?: TTableIndexReturnType<IEntityRolesEntity, IEntityRolesTable, 'type', IEntityRolesTableIndexes>;
  ids?: TTableIndexReturnType<IEntityRolesEntity, IEntityRolesTable, 'id', IEntityRolesTableIndexes>[];
}


export interface IEntityRolesApi {
  count(options?: IEntityRolesListOptions): Promise<number>;
  list(options?: IEntityRolesListOptions): Promise<IEntityRolesEntity[]>;
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


export interface INotificationEntity extends TAbstractEntity {
  timestamp: Date;
  sender: number;
  recipient: number;
  parameters: { [key: string]: Date | string };
  title: string;
  body: string;
  seen?: Date;
  target: string;
}


export type TNotificationTableIndexes = 'recipient' | 'seen';


export interface INotificationTable extends IAbstractTable<INotificationEntity, TNotificationTableIndexes> {
  name: 'Notification';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    recipient: ITableIndexDefinition<INotificationEntity, INotificationEntity['recipient']>;
    seen: ITableIndexDefinition<INotificationEntity, INotificationEntity['seen']>;
  };
}


export interface INotificationListOptions
  extends IEntityListOptions<INotificationEntity, INotificationTable, TNotificationTableIndexes> {
  recipient?: TTableIndexReturnType<INotificationEntity, INotificationTable, 'recipient', TNotificationTableIndexes>;
}


export interface INotificationApiSeenOptions {
  notificationIds: TTableIndexReturnType<INotificationEntity, INotificationTable, 'oid', TNotificationTableIndexes>[];
}


export interface INotificationApi {
  count(options?: INotificationListOptions): Promise<number>;
  list(options?: INotificationListOptions): Promise<INotificationEntity[]>;
  store(entitySpec: Partial<INotificationEntity>): Promise<INotificationEntity>;
  trash(options: IEntityTrashOptions): Promise<INotificationEntity>;
  seen(options: INotificationApiSeenOptions): Promise<void>;
}


declare global {
  interface IAPI {
    notification: INotificationApi;
  }
}


export interface IRemodeDeviceSpec {
  device: {
    id: string;
    native: boolean;
    platform: string;
    model: string;
    version: string;
    language: string;
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
  mail: ITableIndexDefinition<IMemberEntity, IMemberEntity['mail']>;
}


export type TMemberTableIndexes = keyof IMemberTableIndexes;


export type TMemberTableVectorIndexes = 'searchVector';


export interface IMemberTable extends IAbstractTable<IMemberEntity, TMemberTableIndexes, TMemberTableVectorIndexes> {
  name: 'Member';
  useDataField: true;
  indexes: TTableIndexDefinitions & IMemberTableIndexes;
  vectorIndexes: {
    searchVector: ITableVectorIndexDefinition<IMemberEntity>;
  };
}


export interface IMemberListOptions
  extends IEntityListOptions<IMemberEntity, IMemberTable, TMemberTableIndexes, TMemberTableVectorIndexes> {
  mails?: TTableIndexReturnType<IMemberEntity, IMemberTable, 'mail', TMemberTableIndexes>[];
  roles?: TTableIndexReturnType<IEntityRolesEntity, IEntityRolesTable, 'roles', IEntityRolesTableIndexes>;
  searchVector?: string;
}


export interface IMemberApiLoginOptions {
  mail: IMemberEntity['mail'];
  password: string;
  instance: IMemberEntity['applicationInstance'];
  device: IRemodeDeviceSpec;
}

export interface IMemberAPILoginResponse {
  error?: string;
  member?: IMemberEntity;
  token?: ISessionEntity['token'];
  roles?: IRoleEntity['oid'][];
  permissions?: TPermission[];
}


export interface IMemberApiAuthenticateTokenOptions {
  token: ISessionEntity['token'];
}


export interface IMemberApiRegisterOptions {
  userName?: IMemberEntity['userName'];
  lastName?: IMemberEntity['lastName'];
  firstName?: IMemberEntity['firstName'];
  mail: IMemberEntity['mail'];
  password: string;
  instance: IMemberEntity['applicationInstance'];
  device: IRemodeDeviceSpec;
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
  store(entitySpec: Partial<IMemberEntity>): Promise<IMemberEntity>;
  trash(options: IEntityTrashOptions): Promise<IMemberEntity>;
  getInstances(options: IMemberApiGetInstancesOptions): Promise<IMemberApiGetInstancesResponse>;
  checkMail(options: IMemberApiCheckMailOptions): Promise<IMemberApiCheckMailResponse>;
  authenticateToken(options: IMemberApiAuthenticateTokenOptions): Promise<IMemberAPILoginResponse>;
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


export interface IMailTemplateVariables {
  language?: TLanguageLocale;
  attachment?: {
    filename: string;
    content: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}


export interface IMailEntity extends TAbstractEntity {
  domain: string;
  mid: string;
  status: TMailStatus;
  from: string;
  cc: string;
  recipients: string;
  template: string;
  variables: IMailTemplateVariables;
  lastError: string;
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


export interface IMailEventEntity extends TAbstractEntity {
  timestamp: Date;
  mid: string;
  recipient: string;
  mailClass: string;
  status: TMailStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any };
}


export type TMailEventTableIndexes = 'timestamp' | 'mid' | 'recipient' | 'mailClass' | 'status';


export interface IMailEventTable extends IAbstractTable<IMailEventEntity, TMailEventTableIndexes> {
  name: 'MailEvent';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    timestamp: ITableIndexDefinition<IMailEventEntity, IMailEventEntity['timestamp']>;
    mid: ITableIndexDefinition<IMailEventEntity, IMailEventEntity['mid']>;
    recipient: ITableIndexDefinition<IMailEventEntity, IMailEventEntity['recipient']>;
    mailClass: ITableIndexDefinition<IMailEventEntity, IMailEventEntity['mailClass']>;
    status: ITableIndexDefinition<IMailEventEntity, IMailEventEntity['status']>;
  };
}


export interface ILogRecordEntity extends TAbstractEntity {
  timestamp: Date;
  bulk: string;
  logLevel: number;
  message: string;
  data: {
    action?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}


export type TLogRecordTableIndexes = 'timestamp' | 'bulk' | 'logLevel' | 'action';


export interface ILogRecordTable extends IAbstractTable<ILogRecordEntity, TLogRecordTableIndexes> {
  name: 'LogRecord';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    timestamp: ITableIndexDefinition<ILogRecordEntity, ILogRecordEntity['timestamp']>;
    bulk: ITableIndexDefinition<ILogRecordEntity, ILogRecordEntity['bulk']>;
    logLevel: ITableIndexDefinition<ILogRecordEntity, ILogRecordEntity['logLevel']>;
    action: ITableIndexDefinition<ILogRecordEntity, ILogRecordEntity['data']['action']>;
  };
}


export interface ILogRecordListOptions
  extends IEntityListOptions<ILogRecordEntity, ILogRecordTable, TLogRecordTableIndexes> {}


export interface ILogRecordApi {
  count(options?: ILogRecordListOptions): Promise<number>;
  list(options?: ILogRecordListOptions): Promise<ILogRecordEntity[]>;
  store(entitySpec: Partial<ILogRecordEntity>): Promise<ILogRecordEntity>;
  trash(options: IEntityTrashOptions): Promise<ILogRecordEntity>;
  flushRecordStack(exception?: object): Promise<void>;
}


declare global {
  interface IAPI {
    logRecord: ILogRecordApi;
  }
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
  device: IRemodeDeviceSpec;
  foreground: boolean;
  push?: { token: string; provider: TPushProvider; timestamp: Date };
  lastAccess: Date;
  closed: Date;
  saving: boolean;
}


export type TSessionTableIndexes = 'lastAccess' | 'token' | 'pushToken' | 'pushProvider' | 'pushTimestamp' | 'closed';


export interface ISessionTable extends IAbstractTable<ISessionEntity, TSessionTableIndexes> {
  name: 'Session';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    lastAccess: ITableIndexDefinition<ISessionEntity, ISessionEntity['lastAccess']>;
    token: ITableIndexDefinition<ISessionEntity, ISessionEntity['token']>;
    pushToken: ITableIndexDefinition<ISessionEntity, string | undefined>;
    pushProvider: ITableIndexDefinition<ISessionEntity, TPushProvider | undefined>;
    pushTimestamp: ITableIndexDefinition<ISessionEntity, Date | undefined>;
    closed: ITableIndexDefinition<ISessionEntity, ISessionEntity['closed']>;
  };
}


export interface ISessionListOptions extends IEntityListOptions<ISessionEntity, ISessionTable, TSessionTableIndexes> {
  token?: TTableIndexReturnType<ISessionEntity, ISessionTable, 'token', TSessionTableIndexes>;
  closed?: TTableIndexReturnType<ISessionEntity, ISessionTable, 'closed', TSessionTableIndexes>;
}


declare global {
  interface IDerivatives {
    thumbnail: null;
    media: null;
    avatar: null;
    cardCompact: null;
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

  type TLogRecordEntityPermission =
    | 'log record entity - count own'
    | 'log record entity - count all'
    | 'log record entity - list own'
    | 'log record entity - list all'
    | 'log record entity - create own'
    | 'log record entity - update own'
    | 'log record entity - update all'
    | 'log record entity - trash own'
    | 'log record entity - trash all';

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
    | 'entity roles api - store'
    | 'entity roles api - trash';

  type TRoleAPIPermission = 'role api - count' | 'role api - list' | 'role api - store' | 'role api - trash';

  type TPermissionAPIPermission = 'permission api - list';

  type TApplicationInstanceAPIPermission =
    | 'application instance api - count'
    | 'application instance api - list'
    | 'application instance api - store'
    | 'application instance api - trash'
    | 'application instance api - create';

  type TFileAPIPermission =
    | 'file api - download'
    | 'file api - count'
    | 'file api - list'
    | 'file api - store'
    | 'file api - trash'
    | 'file api - duplicate'
    | 'file api - create from data url'
    | 'file api - create from external url';

  type TBatchAPIPermission = 'batch api - list' | 'batch api - start';

  type TEntityAPIPermission = 'entity api - list' | 'entity api - reindex';

  type TExceptionAPIPermission = 'exception api - log';

  type TJobAPIPermission = 'job api - list';

  type TLogRecordAPIPermission =
    | 'log record api - count'
    | 'log record api - list'
    | 'log record api - store'
    | 'log record api - trash'
    | 'log record api - flush record stack';

  type TNotificationAPIPermission =
    | 'notification api - count'
    | 'notification api - list'
    | 'notification api - store'
    | 'notification api - trash'
    | 'notification api - seen';

  type TPushServerAPIPermission = 'push server api - register';

  type TMemberAPIPermission =
    | 'member api - count'
    | 'member api - list'
    | 'member api - store'
    | 'member api - trash'
    | 'member api - get instances'
    | 'member api - check mail'
    | 'member api - check user name'
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
    | TLogRecordEntityPermission
    | TSessionEntityPermission
    | TMemberEntityPermission
    | TEntityRolesAPIPermission
    | TRoleAPIPermission
    | TPermissionAPIPermission
    | TApplicationInstanceAPIPermission
    | TFileAPIPermission
    | TBatchAPIPermission
    | TEntityAPIPermission
    | TExceptionAPIPermission
    | TJobAPIPermission
    | TLogRecordAPIPermission
    | TNotificationAPIPermission
    | TPushServerAPIPermission
    | TMemberAPIPermission
    | TRootAPIPermission;
}


export {};




