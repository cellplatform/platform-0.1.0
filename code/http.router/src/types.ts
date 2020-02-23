import * as t from './common/types';
import { IncomingMessage } from './types.lib';

/**
 * Router
 */
export type IRouterArgs = {
  bodyParser: t.BodyParser;
};

export type IRouter<C extends object = {}> = {
  readonly routes: Array<IRoute<C>>;
  readonly handler: RouteHandler<C>;
  readonly wildcard: IRoute<C> | undefined;
  add(method: t.HttpMethod, path: IRoutePath, handler: RouteHandler): IRouter<C>;
  get(path: IRoutePath, handler: RouteHandler<C>): IRouter<C>;
  put(path: IRoutePath, handler: RouteHandler<C>): IRouter<C>;
  post(path: IRoutePath, handler: RouteHandler<C>): IRouter<C>;
  delete(path: IRoutePath, handler: RouteHandler<C>): IRouter<C>;
  find(req: { method?: string; url?: string }): IRoute<C> | undefined;
};

/**
 * Handler
 */
export type RouteHandler<C extends object = {}> = (
  req: Request,
  context: C,
) => Promise<RouteResponse | undefined>;

/**
 * Request
 */
export type Request = IncomingMessage & {
  host: string;
  params: RequestParams;
  query: RequestQuery;
  body: RequestBody;

  // Methods
  header(key: string): string;
  toUrl(path: string): string;
  redirect(path: string, options?: { headers?: t.IHttpHeaders; status?: 307 | 303 }): RouteResponse;
};

export type RequestParams = { [key: string]: string | number | boolean };
export type RequestQuery = {
  [key: string]: string | number | boolean | Array<string | number | boolean>;
};

/**
 * Request body
 */

export type RequestBody = {
  json<T>(options?: ParseBodyJsonOptions<T>): Promise<T>;
  buffer(options?: ParseBodyBufferOptions): Promise<string | Uint8Array>;
  form(options?: ParseBodyFormOptions): Promise<IForm>;
};

export type ParseBodyJsonOptions<T> = { default?: T; limit?: string | number; encoding?: string };
export type ParseBodyFormOptions = { limits?: IFormLimits };
export type ParseBodyBufferOptions = {
  default?: string | Buffer;
  limit?: string | number;
  encoding?: string;
};

export type BodyParser = {
  json<T>(req: t.IncomingMessage, options?: t.ParseBodyJsonOptions<T>): Promise<T>;
  form(req: t.IncomingMessage, options?: t.ParseBodyFormOptions): Promise<IForm>;
  buffer(req: t.IncomingMessage, options?: t.ParseBodyBufferOptions): Promise<string | Uint8Array>;
};

/**
 * Response
 */
export type RouteResponse = {
  status?: number;
  data?: any;
  headers?: t.IHttpHeaders;
};

/**
 * Route (definition)
 */
export type IRoute<C extends object = {}> = {
  readonly method: t.HttpMethod;
  readonly path: string;
  readonly handler: RouteHandler<C>;
  readonly regex: RegExp;
  readonly tokens: t.Token[];
  readonly keys: t.Key[];
};

export type IRoutePath = string | string[];

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
