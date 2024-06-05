import { LanguageLocale, JSONValue } from 'mn-tools';

declare global {
  interface IDerivatives {
    thumbnail?: null;
    media?: null;
    avatar?: null;
    navigationHeader?: null;
  }
}

export interface INotificationEntity extends IAbstractEntity {
  timestamp: Date;
  sender: number;
  recipient: number;
  parameters: { [key: string]: Date | string };
  title: string;
  body: string;
  seen?: Date;
  target: string;
}

export type NotificationTarget = 'SMS' | 'mail' | 'push';

export interface INotificationApiListOptions {
  recipient: number;
}

export interface INotificationApiSeenOptions {
  notificationIds: number[];
}

export interface INotificationApi {
  list(request: INotificationApiListOptions): Promise<INotificationEntity[]>;
  seen(request: INotificationApiSeenOptions): Promise<void>;
  store(entity: INotificationEntity): Promise<INotificationEntity>;
}

declare global {
  interface IAPI {
    notification: INotificationApi;
  }
}

export interface IPushServerApiRegisterOptions {
  provider: PushProvider;
  token: string;
  client: {
    name: string;
    stage: string;
    version: string;
    language: LanguageLocale;
    userAgent: string;
  };
}

export type PushProvider = 'fcm' | 'apn' | 'ws';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IPushMessage<PAYLOAD extends IPushMessagePayload = IPushMessagePayload> {
  title?: string;
  body?: string;
  nbNotifications?: number;
  payload?: PAYLOAD;
}

interface IPushMessageReleasePayload {
  type: 'release';
  version: string;
}

export interface IPushMessageRelease extends IPushMessage<IPushMessageReleasePayload> {}

export interface ISessionEntity extends IAbstractEntity {
  token: string;
  member: number;
  device: IRemodeDeviceSpec;
  foreground: boolean;
  push: { token: string; provider: PushProvider; timestamp: Date };
  created: Date;
  lastAccess: Date;
  closed: Date;
  saving: boolean;
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

export interface IMemberSettings {
  darkTheme: boolean;
  tips: { [uuid: string]: boolean };
}

export interface IMemberEntity extends IAbstractEntity {
  firstName: string;
  lastName: string;
  picture: number;
  pictureEffects: IFileEffect[];
  language: LanguageLocale;
  timeZone: string;
  mail: string;
  password?: string;
  settings: IMemberSettings;
  insights: IInsighsStorage;
  permissions?: string[];
  roles?: number[];
}

export interface IMemberApiListOptions extends IEntityListOptions {
  mail?: string | string[];
  role?: number | number[];
  searchTerms?: string;
}

export interface IMemberAPILoginResponse {
  error?: string;
  member?: IMemberEntity;
  token?: string;
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

export type MemberInsightPartAction = 'stop' | 'next' | 'skip' | 'later' | 'doneOnce';

export interface IMemberInsightPart {
  action?: MemberInsightPartAction;
  date?: Date;
}

export interface IInsightStop {
  count: number;
  date: Date;
}

export interface IInsightLater {
  date: Date;
}

export interface IInsight {
  stop?: IInsightStop;
  later?: IInsightLater;
  parts: {
    [id: string]: IMemberInsightPart;
  };
}

export interface IInsighsStorage {
  [group: string]: IInsight;
}

export interface IMemberApiLoginOptions {
  mail: string;
  password: string;
  instance: number;
  device: IRemodeDeviceSpec;
}

export interface IMemberApiRegisterOptions {
  lastName: string;
  firstName: string;
  mail: string;
  password: string;
  instance: number;
  device: IRemodeDeviceSpec;
}

export interface IMemberApiFinalizeRegisterOptions {
  oid: number;
  lastName: string;
  firstName: string;
  mail: string;
  password: string;
  instance: number;
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
}

export interface IMemberApiGetPermissionsResponse {
  permissions: string[];
}

export interface IMemberApiForgotPasswordOptions {
  mail: string;
}

export interface IMemberApiForgotPasswordResponse {
  sent: boolean;
}

export interface IMemberApiImportOptions {
  members: Partial<IMemberEntity>[];
}

export interface IMemberApiImportResponse {
  created: number;
  invited: IMemberEntity[];
}

export interface IMemberApi {
  count(request?: IMemberApiListOptions): Promise<number>;
  list(request?: IMemberApiListOptions): Promise<IMemberEntity[]>;
  store(entitySpec: Partial<IMemberEntity>): Promise<IMemberEntity>;
  getInstances(request: IMemberApiGetInstancesOptions): Promise<IMemberApiGetInstancesResponse>;
  checkMail(request: IMemberApiCheckMailOptions): Promise<IMemberApiCheckMailResponse>;
  login(request: IMemberApiLoginOptions): Promise<IMemberAPILoginResponse>;
  register(request: IMemberApiRegisterOptions): Promise<IMemberAPILoginResponse>;
  finalizeRegister(request: IMemberApiFinalizeRegisterOptions): Promise<IMemberAPILoginResponse>;
  forgotPassword(request: IMemberApiForgotPasswordOptions): Promise<IMemberApiForgotPasswordResponse>;
  logout(): Promise<void>;
  getPermissions(request: IMemberApiGetPermissionsOptions): Promise<IMemberApiGetPermissionsResponse>;
  import(options: IMemberApiImportOptions): Promise<IMemberApiImportResponse>;
}

declare global {
  interface IAPI {
    member: IMemberApi;
  }
}

export interface IMailTemplateVariables {
  language?: LanguageLocale;
  attachment?: {
    filename: string;
    content: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IMailEntity extends IAbstractEntity {
  domain: string;
  mid: string;
  status: 'sent' | 'new' | 'error';
  from: string;
  cc: string;
  recipients: string;
  template: string;
  variables: IMailTemplateVariables;
  lastError: string;
  links: string[];
}

export interface ILogRecordEntity extends IAbstractEntity {
  timestamp: Date;
  bulk: string;
  logLevel: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any };
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

export interface IException extends IEntity {
  terminal: { version: string };
  timestamp: Date;
  source: string;
  version: number;
  os: { name: string; version: string };
}

export interface IExceptionApi {
  log(exception: IException): Promise<void>;
}

declare global {
  interface IAPI {
    exception: IExceptionApi;
  }
}

export interface IFileEntity extends IAbstractEntity {
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption?: string;
  data?: string;
  duration?: number;
}

export interface IFileDerivative<E extends IFileEffect> {
  effects: E[];
}

export interface IFileEffect {
  uuid: string;
  mimeType: string;

  // Utilisé pour les effets portés par les Entités, notamment pour pouvoir fixer un timestamp lors de la requête.
  // Mettre undefined pour les derivatives définies sur le serveur
  changed: Date;
}

export interface IFileCropEffect extends IFileEffect {
  uuid: 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
  mimeType: 'image/png';
  scale: number;
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

export interface IFileApiDownloadFileOptions {
  oid: number;
  timestamp?: string;
  derivative?: TDerivative;
  effects?: string; // un IFileEffect[] stringifié
}

export interface IFileListOptions extends IEntityListOptions {}

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

export interface IFileTrashOptions extends IEntityTrashOptions {}

export interface IFileApi {
  count(request?: IFileListOptions): Promise<number>;
  list(request?: IFileListOptions): Promise<IFileEntity[]>;
  store(entitySpec: Partial<IFileEntity>): Promise<IFileEntity>;
  trash(request: IFileTrashOptions): Promise<void>;
  createFromDataUrl(request: IFileApiCreateFromDataUrlOptions): Promise<IFileEntity>;
  createFromExternalUrl(request: IFileApiCreateFromExternalUrlOptions): Promise<IFileApiCreateFromExternalUrlResponse>;
}

declare global {
  interface IAPI {
    file: IFileApi;
  }

  interface IDerivatives {
    default?: null;
  }
}

export type TDerivative = keyof IDerivatives;

export interface IApplicationInstanceEntity extends IAbstractEntity {
  name: string;
  title: string;
}

export interface IApplicationInstanceListOptions extends IEntityListOptions {
  name?: string;
}

export interface IApplicationInstanceCreateOptions extends IEntityListOptions {
  instance: Partial<IApplicationInstanceEntity>;
  administrator: Partial<IMemberEntity>;
}

export interface IApplicationInstanceTrashOptions extends IEntityTrashOptions {}

export interface IApplicationInstanceApi {
  count(request: IApplicationInstanceListOptions): Promise<number>;
  list(request: IApplicationInstanceListOptions): Promise<IApplicationInstanceEntity[]>;
  store(entitySpec: Partial<IApplicationInstanceEntity>): Promise<IApplicationInstanceEntity>;
  create(request: IApplicationInstanceCreateOptions): Promise<IApplicationInstanceEntity>;
  trash(request: IApplicationInstanceTrashOptions): Promise<IApplicationInstanceEntity>;
}

declare global {
  interface IAPI {
    applicationInstance: IApplicationInstanceApi;
  }
}

export interface IEntityRolesEntity extends IEntity {
  id: string;
  type: string;
  roles: number[];
}

export interface IEntityRolesListOptions {
  entityType: string;
  entityId: number | number[];
}

export interface IEntityRolesListResult {
  entityType: string;
  entityId: number;
  permissions?: string[];
  roles?: number[];
}

export interface IEntityRolesApi {
  list(query: IEntityRolesListOptions): Promise<IEntityRolesListResult[]>;
  store(spec: IEntityRolesListResult): Promise<IEntityRolesEntity>;
}

export interface IRoleEntity extends IAbstractEntity {
  machineName: string;
  title: string;
  permissions: string[];
}

export interface IRoleApiListOptions extends IEntityListOptions {}

export interface IRoleApiTrashOptions extends IEntityTrashOptions {}

export interface IRoleApi {
  count(request?: IRoleApiListOptions): Promise<number>;
  list(request?: IRoleApiListOptions): Promise<IRoleEntity[]>;
  store(entitySpec: Partial<IRoleEntity>): Promise<IRoleEntity>;
  trash(request: IRoleApiTrashOptions): Promise<IRoleEntity>;
}

export interface IPermission {
  service: string;
  permission: string;
}

export interface IPermissionApiListOptions {}

export interface IPermissionApi {
  list(query?: IPermissionApiListOptions): Promise<IPermission[]>;
}

declare global {
  interface IAPI {
    role: IRoleApi;
    entityRoles: IEntityRolesApi;
    permission: IPermissionApi;
  }
}

export type IAccessControlOwner = 'member' | 'role';

export type IAccessControlPermission = 'view' | 'list' | 'modify' | 'delete';

export interface IAccessControlEntity {
  objectType: string;
  objectId: number;
  ownerType: IAccessControlOwner;
  ownerId: number;
  permissions: IAccessControlPermission[];
  tag?: string;
}

export interface IEntity {
  /** entity unique ID */
  oid: number;
}

export interface IAbstractEntity extends IEntity {
  /** Creation date. */
  created: Date;
  creator?: number;
  applicationInstance: number;

  /** Modification date. */
  changed: Date;

  /** Modification date from a user action. */
  userChanged: Date;

  /** Supprimé */
  deleted?: Date;
  deletedBy?: number;
}

export interface IEntityListSortOption {
  field: string;
  order: IEntitySortOrder;
}

export interface IEntityListPagerOption {
  from: number;
  count: number;
}

export interface IEntityListOptions {
  sort?: IEntityListSortOption[];
  oids?: number[];
  excludeOids?: number[];
  deleted?: boolean;
  owner?: number;
  pager?: IEntityListPagerOption;
}

export interface IEntityTrashOptions {
  oid: number;
}

export type EntityFieldType = 'string' | 'integer' | 'date' | 'boolean' | 'token';

export type IEntitySortOrder = 'asc' | 'desc';

export interface IEntityFieldDefinition {
  callback: string;
  fieldType: EntityFieldType;
  fieldName: string;
  sqlFieldName: string;
  isArray: boolean;
  textSearch: boolean;
}

export interface IEntityIndex {
  name: string;
  type: EntityFieldType;
}

export interface IEntityListResult {
  name: string;
  count?: number;
  indexes: IEntityIndex[];
}

export interface IEntityReindexOptions {
  entityName: string;
}

export interface IQueryFieldOperator {
  name: string;
  types: EntityFieldType[];
}

export interface IQueryFieldIndex {
  name: string;
  type: EntityFieldType;
}

export interface IQueryField {
  index: IQueryFieldIndex;
  operator: IQueryFieldOperator;
  value: string;
  date: Date;
}

export interface IEntityQueryOptions {
  entity: { name: string; indexes: IEntityIndex[] };
  fields: IQueryField[];
  limit?: number;
}

export interface IEntityDefinitionResult {
  name: string;
  indexes: IQueryFieldIndex[];
}

export interface IEntityDefinitionsOptions {}

export interface IEntityListAllOptions {}

export interface IEntityApplyOptions {
  name: string;
  value: IAbstractEntity;
}

export interface IEntityApi {
  list(request?: IEntityListAllOptions): Promise<IEntityListResult[]>;
  reindex(request: IEntityReindexOptions): Promise<IJobResponse>;
  apply(request: IEntityApplyOptions): Promise<IJob>;
  query(request: IEntityQueryOptions): Promise<IEntity[]>;
  entityDefinitions(request?: IEntityDefinitionsOptions): Promise<IEntityDefinitionResult[]>;
}

declare global {
  interface IAPI {
    entity: IEntityApi;
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
