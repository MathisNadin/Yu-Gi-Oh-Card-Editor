/* eslint-disable import/export */

import { TForbidTypeChanges, LanguageLocale, JSONValue } from 'mn-tools';

// Pour faire de ceci un module
export interface IDummy {}

declare global {
  interface IDerivatives {
    thumbnail: null;
    media: null;
    avatar: null;
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

export interface IAbstractTable<E extends TAbstractEntity = TAbstractEntity, K extends string = never> {
  query: IQuery<E, this, K>;
  name: string;
  useDataField: boolean;
  indexes: TTableIndexDefinitions & TTableOtherIndexes<E, K>;
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
  | '@@ to_tsquery';

export interface IQueryCondition {
  field: string;
  operator: TQueryConditionOperator;
  value?: TSQLValue;
}

export type TQueryJoinType = 'JOIN' | 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL JOIN';

export interface IQueryJoin {
  joinType: TQueryJoinType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  otherQuery: IQuery<any, any>;
  joinConditions: string[];
}

export interface IQuery<E extends TAbstractEntity, T extends IAbstractTable<E, K>, K extends string = never> {
  table: T;
  conditions: IQueryCondition[];
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
  buildConditionClause(condition: IQueryCondition, startIndex: number): string;
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

export interface IQueryPagerOptions {
  from: number;
  count: number;
}

export interface IEntityListOptions<E extends TAbstractEntity, K extends string = never> {
  sort?: IEntityListSortOption<E, K>[];
  oids?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'oid'>, 'oid'>[];
  excludeOids?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'oid'>, 'oid'>[];
  deleted?: boolean;
  creator?: TTableIndexReturnType<TAbstractEntity, IAbstractTable<TAbstractEntity, 'creator'>, 'creator'>;
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
  list(request?: IEntityListAllOptions): Promise<IEntityListResult[]>;
  reindex(request: IEntityReindexOptions): Promise<IJobResponse>;
}

declare global {
  interface IAPI {
    entity: IEntityApi;
  }
}

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

export interface INotificationListOptions extends IEntityListOptions<INotificationEntity, TNotificationTableIndexes> {
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
  seen(request: INotificationApiSeenOptions): Promise<void>;
}

declare global {
  interface IAPI {
    notification: INotificationApi;
  }
}

export interface IPushServerApiRegisterOptions {
  provider: TPushProvider;
  token: string;
  client: {
    name: string;
    stage: string;
    version: string;
    language: LanguageLocale;
    userAgent: string;
  };
}

export type TPushProvider = 'fcm' | 'apn' | 'ws';

export interface IPushServerApiRegisterResponse {}

export interface IPushServerApi {
  register(request: IPushServerApiRegisterOptions): Promise<IPushServerApiRegisterResponse>;
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

export interface ISessionEntity extends TAbstractEntity {
  token: string;
  device: IRemodeDeviceSpec;
  foreground: boolean;
  push: { token: string; provider: TPushProvider; timestamp: Date };
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
    pushToken: ITableIndexDefinition<ISessionEntity, ISessionEntity['push']['token']>;
    pushProvider: ITableIndexDefinition<ISessionEntity, ISessionEntity['push']['provider']>;
    pushTimestamp: ITableIndexDefinition<ISessionEntity, ISessionEntity['push']['timestamp']>;
    closed: ITableIndexDefinition<ISessionEntity, ISessionEntity['closed']>;
  };
}

export interface ISessionListOptions extends IEntityListOptions<ISessionEntity, TSessionTableIndexes> {
  token?: TTableIndexReturnType<ISessionEntity, ISessionTable, 'token', TSessionTableIndexes>;
}

export interface IBatchCategory {
  tool: 'Outil';
  export: 'Exports';
}

export type BatchCategories = keyof IBatchCategory;

export interface IBatchInfo {
  description: string;
  name: string;
  commandOnly: boolean;
  parameterDefinitions: IBatchParameterDefinition[];
}

export type BatchReportFormatter = 'json' | 'graph' | 'table';

export type IBatchReportPart = IBatchGraphReport | IBatchTableReport | IBatchJsonReport | IBatchMarkdownReport;

export type BatchReport = IBatchReportPart[];

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
  rows: JSONValue[][];
}

export type BatchGraphReportType = 'lines' | 'donnut';

export interface IBatchGraphReport {
  formatter: 'graph';
  title?: string;
  type: BatchGraphReportType;
}

export type BatchParameterType = 'json' | 'string' | 'number' | 'boolean' | 'string[]' | 'number[]';

export interface IBatchParameterDefinition {
  name: string;
  type: BatchParameterType;
  required?: boolean;
  description?: string;
}

export interface IBatchNextOptions {
  systemVersion: string;
}

export interface IBatchListOptions {}

export interface IBatchCheckResultsOptions {}

export interface IBatchCheckResultsResponse {
  toDo: string[];
}

export type IBatchParameterType = string | boolean | number | number[] | string[];

export interface IBatchParameters {
  [name: string]: IBatchParameterType;
}

export interface IBatchStartOptions {
  name: string;
  parameters?: IBatchParameters;
}

export interface IBatchApi {
  list(request?: IBatchListOptions): Promise<IBatchInfo[]>;
  checkResults(request?: IBatchCheckResultsOptions): Promise<IBatchCheckResultsResponse>;
  start(request: IBatchStartOptions): Promise<BatchReport>;
}

declare global {
  interface IAPI {
    batch: IBatchApi;
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
    language: LanguageLocale;
  };
}

export interface IMemberEntity extends TAbstractEntity {
  mail: string;
  password?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  picture?: number;
  pictureEffects: IFileEffect[];
  language: LanguageLocale;
  timeZone?: string;
  darkTheme: boolean;
  tips: { [uuid: string]: boolean };
}

export interface IMemberTableIndexes {
  mail: ITableIndexDefinition<IMemberEntity, IMemberEntity['mail']>;
  searchContent: ITableIndexDefinition<IMemberEntity, string>;
}

export type TMemberTableIndexes = keyof IMemberTableIndexes;

export interface IMemberTable extends IAbstractTable<IMemberEntity, TMemberTableIndexes> {
  name: 'Member';
  useDataField: true;
  indexes: TTableIndexDefinitions & IMemberTableIndexes;
}

export interface IMemberListOptions extends IEntityListOptions<IMemberEntity, TMemberTableIndexes> {
  mails?: TTableIndexReturnType<IMemberEntity, IMemberTable, 'mail', TMemberTableIndexes>[];
  roles?: TTableIndexReturnType<IEntityRolesEntity, IEntityRolesTable, 'roles', IEntityRolesTableIndexes>;
  searchContent?: TTableIndexReturnType<IMemberEntity, IMemberTable, 'searchContent', TMemberTableIndexes>;
}

export interface IMemberAPILoginResponse {
  error?: string;
  member?: IMemberEntity;
  token?: ISessionEntity['token'];
  roles?: IRoleEntity['oid'][];
  permissions?: IPermission['permission'][];
}

export interface IMemberApiLoginOptions {
  mail: IMemberEntity['mail'];
  password: string;
  instance: IMemberEntity['applicationInstance'];
  device: IRemodeDeviceSpec;
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

export interface IMemberApiFinalizeRegisterOptions {
  oid: IMemberEntity['oid'];
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
  permissions: IPermission['permission'][];
}

export interface IMemberApiForgotPasswordOptions {
  mail: string;
}

export interface IMemberApiForgotPasswordResponse {
  sent: boolean;
}

export interface IMemberApiImportResponse {
  created: number;
  invited: IMemberEntity[];
}

export interface IMemberApi {
  count(request?: IMemberListOptions): Promise<number>;
  list(request?: IMemberListOptions): Promise<IMemberEntity[]>;
  store(entitySpec: Partial<IMemberEntity>): Promise<IMemberEntity>;
  trash(options: IEntityTrashOptions): Promise<IMemberEntity>;
  getInstances(request: IMemberApiGetInstancesOptions): Promise<IMemberApiGetInstancesResponse>;
  checkMail(request: IMemberApiCheckMailOptions): Promise<IMemberApiCheckMailResponse>;
  login(request: IMemberApiLoginOptions): Promise<IMemberAPILoginResponse>;
  register(request: IMemberApiRegisterOptions): Promise<IMemberAPILoginResponse>;
  finalizeRegister(request: IMemberApiFinalizeRegisterOptions): Promise<IMemberAPILoginResponse>;
  forgotPassword(request: IMemberApiForgotPasswordOptions): Promise<IMemberApiForgotPasswordResponse>;
  logout(): Promise<void>;
  getPermissions(request: IMemberApiGetPermissionsOptions): Promise<IMemberApiGetPermissionsResponse>;
}

declare global {
  interface IAPI {
    member: IMemberApi;
  }
}

export type TMailStatus = 'sent' | 'new' | 'error';

export interface IMailTemplateVariables {
  language?: LanguageLocale;
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

export interface ILogRecordApi {
  count(options?: IEntityListOptions<ILogRecordEntity, TLogRecordTableIndexes>): Promise<number>;
  list(options?: IEntityListOptions<ILogRecordEntity, TLogRecordTableIndexes>): Promise<ILogRecordEntity[]>;
  store(entitySpec: Partial<ILogRecordEntity>): Promise<ILogRecordEntity>;
  trash(options: IEntityTrashOptions): Promise<ILogRecordEntity>;
  flushRecordStack(exception?: object): Promise<void>;
}

declare global {
  interface IAPI {
    logRecord: ILogRecordApi;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IJob<R = any> {
  id: string;
  name: string;
  description: string;
  error: string;
  result: R;
  message: string;
  total: number;
  state: JobState;
  progress: number;
}

export interface IJobResponse {
  job: IJob;
}

export type JobState = 'init' | 'enter' | 'progress' | 'done';

export interface IJobListOptions {
  id?: string;
}

export interface IJobApi {
  list(request?: IJobListOptions): Promise<IJob[]>;
}

declare global {
  interface IAPI {
    job: IJobApi;
  }
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
  log(exception: IExceptionEntity): Promise<void>;
}

declare global {
  interface IAPI {
    exception: IExceptionApi;
  }
}

export interface IFileEntity extends TAbstractEntity {
  public: boolean;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption?: string;
  data?: string;
  duration?: number;
}

export type TFileTableIndexes = 'public';

export interface IFileTable extends IAbstractTable<IFileEntity, TFileTableIndexes> {
  name: 'File';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    public: ITableIndexDefinition<IFileEntity, IFileEntity['public']>;
  };
}

export interface IFileDerivative<E extends IFileEffect> {
  effects: E[];
}

export interface IFileEffect {
  uuid: string;
  mimeType: string;

  // Utilisé pour les effets portés par les Entités, notamment pour pouvoir fixer un timestamp lors de la requête.
  // Laisser undefined pour les derivatives définies sur le serveur
  changed?: Date;
}

export interface IFileCropEffect extends IFileEffect {
  uuid: 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
  mimeType: 'image/png';
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
  mimeType: 'image/png';
  scale: number;
  height: number;
  width: number;
}

export interface IFileThumbnailEffect extends IFileEffect {
  uuid: '35c0f216-4551-4e09-ba48-20f3332e138f';
  mimeType: 'image/png';
}

export interface IFileApiDownloadOptions {
  instance: number;
  oid: number;
  timestamp?: string;
  derivative?: TDerivative;
  /** A stringified IFileEffect[] */
  effects?: string;
}

export interface IFileListOptions extends IEntityListOptions<IFileEntity, TFileTableIndexes> {
  public?: TTableIndexReturnType<IFileEntity, IFileTable, 'public', TFileTableIndexes>;
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
  count(request?: IFileListOptions): Promise<number>;
  list(request?: IFileListOptions): Promise<IFileEntity[]>;
  store(entitySpec: Partial<IFileEntity>): Promise<IFileEntity>;
  trash(request: IEntityTrashOptions): Promise<void>;
  createFromDataUrl(request: IFileApiCreateFromDataUrlOptions): Promise<IFileEntity>;
  createFromExternalUrl(request: IFileApiCreateFromExternalUrlOptions): Promise<IFileApiCreateFromExternalUrlResponse>;
}

declare global {
  interface IAPI {
    file: IFileApi;
  }

  interface IDerivatives {
    default: null;
  }
}

export type TDerivative = keyof IDerivatives;

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
  extends IEntityListOptions<IApplicationInstanceEntity, TApplicationInstanceTableIndexes> {
  name?: TTableIndexReturnType<
    IApplicationInstanceEntity,
    IApplicationInstanceTable,
    'name',
    TApplicationInstanceTableIndexes
  >;
}

export interface IApplicationInstanceCreateOptions
  extends IEntityListOptions<IApplicationInstanceEntity, TApplicationInstanceTableIndexes> {
  instance: Partial<IApplicationInstanceEntity>;
  administrator: Partial<IMemberEntity>;
}

export interface IApplicationInstanceApi {
  count(options?: IApplicationInstanceListOptions): Promise<number>;
  list(options?: IApplicationInstanceListOptions): Promise<IApplicationInstanceEntity[]>;
  store(entitySpec: Partial<IApplicationInstanceEntity>): Promise<IApplicationInstanceEntity>;
  trash(options: IEntityTrashOptions): Promise<IApplicationInstanceEntity>;
  create(request: IApplicationInstanceCreateOptions): Promise<IApplicationInstanceEntity>;
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

export interface IEntityRolesListOptions extends IEntityListOptions<IEntityRolesEntity, IEntityRolesTableIndexes> {
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
  permissions: IPermission['permission'][];
}

export type TRoleTableIndexes = 'machineName';

export interface IRoleTable extends IAbstractTable<IRoleEntity, TRoleTableIndexes> {
  name: 'Role';
  useDataField: true;
  indexes: TTableIndexDefinitions & {
    machineName: ITableIndexDefinition<IRoleEntity, IRoleEntity['machineName']>;
  };
}

export interface IRoleApi {
  count(request?: IEntityListOptions<IRoleEntity, TRoleTableIndexes>): Promise<number>;
  list(request?: IEntityListOptions<IRoleEntity, TRoleTableIndexes>): Promise<IRoleEntity[]>;
  store(entitySpec: Partial<IRoleEntity>): Promise<IRoleEntity>;
  trash(request: IEntityTrashOptions): Promise<IRoleEntity>;
}

export interface IPermission {
  service: string;
  permission: string;
}

export interface IPermissionListOptions {}

export interface IPermissionApi {
  list(query?: IPermissionListOptions): Promise<IPermission[]>;
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
export interface IRouteRecord {
  static: boolean;
  raw?: boolean;
  className?: string;
  methodName: string;
  httpMethod: HttpMethod;
  path: string;
  anonymousAccess: boolean;
}

export type HttpMethod = 'get' | 'post' | 'put' | 'options' | 'delete' | 'all';
