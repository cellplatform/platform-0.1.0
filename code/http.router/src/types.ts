import * as t from './common/types';
import { IncomingMessage } from './types.lib';

/**
 * Router
 */
export type RouterArgs = { body: t.BodyParser };

export type Router<C extends Record<string, unknown> = any> = {
  readonly routes: IRoute<C>[];
  readonly handler: RouteHandler<C>;
  add(method: t.HttpMethod, path: RoutePath, handler: RouteHandler): Router<C>;
  get(path: RoutePath, handler: RouteHandler<C>): Router<C>;
  put(path: RoutePath, handler: RouteHandler<C>): Router<C>;
  post(path: RoutePath, handler: RouteHandler<C>): Router<C>;
  delete(path: RoutePath, handler: RouteHandler<C>): Router<C>;
  wildcard(handler: RouteHandler<C>): Router<C>;
  find(req: { method?: string; url?: string }): IRoute<C> | undefined;
};
export type RoutePath = string | string[];

/**
 * Route (definition)
 */
export type IRoute<C extends Record<string, unknown> = any> = {
  readonly method: t.HttpMethod;
  readonly path: string;
  readonly handler: RouteHandler<C>;
  readonly regex: RegExp;
  readonly tokens: t.Token[];
  readonly keys: t.Key[];
};

/**
 * Handler
 */
export type RouteHandler<C extends Record<string, unknown> = any> = (
  req: RouteRequest,
  context: C,
) => Promise<RouteResponse | undefined>;

/**
 * Request
 */
export type RouteRequest = IncomingMessage & {
  host: string;
  params: RouteRequestParams;
  query: RouteRequestQuery;
  body: RouteRequestBody;
} & RouteRequestMethods;

export type RouteRequestMethods = {
  header(key: string): string;
  toUrl(path: string): string;
  redirect(path: string, options?: { headers?: t.IHttpHeaders; status?: 307 | 303 }): RouteResponse;
};

export type RouteRequestParams = { [key: string]: string | number | boolean };
export type RouteRequestQuery = {
  [key: string]: string | number | boolean | (string | number | boolean)[];
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
 * Body
 */
export type RouteRequestBody = {
  json<T>(options?: ParseBodyJsonOptions<T>): Promise<T>;
  buffer(options?: ParseBodyBufferOptions): Promise<string | Uint8Array>; // NB: in node [Uint8Array] is a [Buffer].
  form(options?: ParseBodyFormOptions): Promise<Form>;
};

export type ParseBodyJsonOptions<T> = { default?: T; limit?: string | number; encoding?: string };
export type ParseBodyFormOptions = { limits?: FormLimits };
export type ParseBodyBufferOptions = {
  default?: string | Buffer;
  limit?: string | number;
  encoding?: string;
};

export type BodyParser = {
  json<T>(req: t.IncomingMessage, options?: t.ParseBodyJsonOptions<T>): Promise<T>;
  form(req: t.IncomingMessage, options?: t.ParseBodyFormOptions): Promise<Form>;
  buffer(req: t.IncomingMessage, options?: t.ParseBodyBufferOptions): Promise<string | Uint8Array>;
};

/**
 * Form
 */
export type Form = {
  fields: FormField[];
  files: FormFile[];
};

export type FormField = {
  key: string;
  value: t.Json;
};

export type FormFile = {
  field: string;
  name: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
};

export type FormLimits = {
  fieldNameSize?: number;
  fieldSize?: number;
  fields?: number;
  fileSize?: number;
  files?: number;
  parts?: number;
  headerPairs?: number;
};
