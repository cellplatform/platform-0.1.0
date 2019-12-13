import { HttpMethod, Json, IDuration } from '@platform/types';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { Key, Token } from 'path-to-regexp';
import { Observable } from 'rxjs';

/**
 * HTTP
 */
export type IHttpHeaders = { [key: string]: string };

/**
 * Request
 */
export type Request = IncomingMessage & {
  host: string;
  params: RequestParams;
  query: RequestQuery;
  body: RequestBody;
  toUrl(path: string): string;
  redirect(path: string, options?: { headers?: IHttpHeaders }): RouteResponse;
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
export type Response = ServerResponse;

/**
 * Handlers
 */
export type RequestHandler = (req: Request, res: Response) => any;
export type RouteHandler = (req: Request) => Promise<RouteResponse | undefined>;

/**
 * Router
 */
export type RouteResponse = {
  status?: number;
  data?: any;
  headers?: IHttpHeaders;
};

export type IRoute = {
  readonly method: HttpMethod;
  readonly path: string;
  readonly handler: RouteHandler;
  readonly regex: RegExp;
  readonly tokens: Token[];
  readonly keys: Key[];
};

export type IRoutePath = string | string[];
export type IRouter = {
  readonly routes: IRoute[];
  readonly handler: RouteHandler;
  readonly wildcard: IRoute | undefined;
  add(method: HttpMethod, path: IRoutePath, handler: RouteHandler): IRouter;
  get(path: IRoutePath, handler: RouteHandler): IRouter;
  put(path: IRoutePath, handler: RouteHandler): IRouter;
  post(path: IRoutePath, handler: RouteHandler): IRouter;
  delete(path: IRoutePath, handler: RouteHandler): IRouter;
  find(req: { method?: string; url?: string }): IRoute | undefined;
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
  server: Server;
  router: IRouter;
  handler: RequestHandler;
  service?: IMicroService;
  events$: MicroEventObservable;
  start: ServerStart;
  stop(): Promise<{}>;
};

export type IMicroService = {
  port: number;
  isRunning: boolean;
  events$: MicroEventObservable;
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
  value: Json;
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

export type MicroEventObservable = Observable<MicroEvent>;
export type MicroEvent =
  | IMicroStartedEvent
  | IMicroStoppedEvent
  | IMicroRequestEvent
  | IMicroResponseEvent;

export type IMicroStartedEvent = {
  type: 'HTTP/started';
  payload: IMicroStarted;
};
export type IMicroStarted = { elapsed: IDuration; port: number };

export type IMicroStoppedEvent = {
  type: 'HTTP/stopped';
  payload: IMicroStopped;
};
export type IMicroStopped = { elapsed: IDuration; port: number; error?: string };

export type IMicroRequestEvent = {
  type: 'HTTP/request';
  payload: IMicroRequest;
};
export type IMicroRequest = {
  method: HttpMethod;
  url: string;
  req: Request;
};

export type IMicroResponseEvent = {
  type: 'HTTP/response';
  payload: IMicroResponse;
};
export type IMicroResponse = IMicroRequest & {
  elapsed: IDuration;
  res: RouteResponse;
};
