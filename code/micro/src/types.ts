// import { HttpMethod, Json, IDuration, IHttpHeaders } from '@platform/types';
// import { IncomingMessage, Server, ServerResponse } from 'http';
// import { Key, Token } from 'path-to-regexp';
import * as t from './common/types';
import { Observable } from 'rxjs';

/**
 * HTTP
 */

/**
 * Request
 */

export type Request = t.IncomingMessage & {
  host: string;
  params: RequestParams;
  query: RequestQuery;
  body: RequestBody;
  toUrl(path: string): string;
  redirect(path: string, options?: { headers?: t.IHttpHeaders }): RouteResponse;
};
export type RequestParams = { [key: string]: string | number | boolean };
export type RequestQuery = {
  [key: string]: string | number | boolean | Array<string | number | boolean>;
};

/**
 * Request body
 */
export type IBodyJsonOptions<T> = { default?: T; limit?: string | number; encoding?: string };
export type IBodyBufferOptions = {
  default?: string | Buffer;
  limit?: string | number;
  encoding?: string;
};
export type IBodyFormOptions = { limits?: IFormLimits };
export type RequestBody = {
  json<T>(options?: IBodyJsonOptions<T>): Promise<T>;
  buffer(options?: IBodyBufferOptions): Promise<string | Buffer>;
  form(options?: IBodyFormOptions): Promise<IForm>;
};

/**
 * Response
 */

export type Response = t.ServerResponse;

/**
 * Handlers
 */
export type RequestHandler = (req: Request, res: Response) => any;
export type RouteHandler<C extends object = {}> = (
  req: Request,
  context: C,
) => Promise<RouteResponse | undefined>;

/**
 * Router
 */

export type RouteResponse = {
  status?: number;
  data?: any;
  headers?: t.IHttpHeaders;
};

export type IRoute = {
  readonly method: t.HttpMethod;
  readonly path: string;
  readonly handler: RouteHandler;
  readonly regex: RegExp;
  readonly tokens: t.Token[];
  readonly keys: t.Key[];
};

export type IRoutePath = string | string[];
export type IRouter<C extends object = {}> = {
  readonly routes: IRoute[];
  readonly handler: RouteHandler;
  readonly wildcard: IRoute | undefined;
  add(method: t.HttpMethod, path: IRoutePath, handler: RouteHandler): IRouter<C>;
  get(path: IRoutePath, handler: RouteHandler<C>): IRouter<C>;
  put(path: IRoutePath, handler: RouteHandler<C>): IRouter<C>;
  post(path: IRoutePath, handler: RouteHandler<C>): IRouter<C>;
  delete(path: IRoutePath, handler: RouteHandler<C>): IRouter<C>;
  find(req: { method?: string; url?: string }): IRoute | undefined;
  log(options?: { indent?: number }): string;
};

/**
 * Server
 */

export type ILogProps = { [key: string]: string | number | boolean };

export type ServerStart = (options?: {
  port?: number;
  log?: ILogProps;
  silent?: boolean;
}) => Promise<IMicroService>;

export type IMicro = {
  server: t.Server;
  router: IRouter;
  handler: RequestHandler;
  service?: IMicroService;
  events$: Observable<MicroEvent>;
  request$: Observable<IMicroRequest>;
  response$: Observable<IMicroResponse>;
  start: ServerStart;
  stop(): Promise<{}>;
};

export type IMicroService = {
  port: number;
  isRunning: boolean;
  events$: Observable<MicroEvent>;
  request$: Observable<IMicroRequest>;
  response$: Observable<IMicroResponse>;
  stop(): Promise<{}>;
};

/**
 * Form
 */

export type IForm = {
  fields: IFormField[];
  files: IFormFile[];
};

export type IFormField = {
  key: string;
  value: t.Json;
};

export type IFormFile = {
  field: string;
  name: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
};

export type IFormLimits = {
  fieldNameSize?: number;
  fieldSize?: number;
  fields?: number;
  fileSize?: number;
  files?: number;
  parts?: number;
  headerPairs?: number;
};

/**
 * [Events]
 */

export type MicroEvent =
  | IMicroStartedEvent
  | IMicroStoppedEvent
  | IMicroRequestEvent
  | IMicroResponseEvent;

export type IMicroStartedEvent = {
  type: 'HTTP/started';
  payload: IMicroStarted;
};
export type IMicroStarted = { elapsed: t.IDuration; port: number };

export type IMicroStoppedEvent = {
  type: 'HTTP/stopped';
  payload: IMicroStopped;
};
export type IMicroStopped = { elapsed: t.IDuration; port: number; error?: string };

export type IMicroRequestEvent = {
  type: 'HTTP/request';
  payload: IMicroRequest;
};
export type IMicroRequest = {
  method: t.HttpMethod;
  url: string;
  req: Request;
  error?: string;
  isModified: boolean;
  modify(input: IMicroRequestModify | (() => Promise<IMicroRequestModify>)): void;
};
export type IMicroRequestModify<C extends object = {}> = { context?: C };

export type IMicroResponseEvent = {
  type: 'HTTP/response';
  payload: IMicroResponse;
};
export type IMicroResponse<C extends object = {}> = {
  elapsed: t.IDuration;
  method: t.HttpMethod;
  url: string;
  req: Request;
  res: RouteResponse;
  error?: string;
  isModified: boolean;
  context: C;
  modify(input: RouteResponse | (() => Promise<RouteResponse>)): void;
};
