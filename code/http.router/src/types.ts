import * as t from './common/types';
import { IncomingMessage } from './types.lib';

/**
 * Router
 */
export type IRouterArgs = {
  body: t.BodyParser;
};

export type IRouter<C extends object = {}> = {
  readonly routes: IRoute<C>[];
  readonly handler: RouteHandler<C>;
  readonly wildcard: IRoute<C> | undefined;
  add(method: t.HttpMethod, path: RoutePath, handler: RouteHandler): IRouter<C>;
  get(path: RoutePath, handler: RouteHandler<C>): IRouter<C>;
  put(path: RoutePath, handler: RouteHandler<C>): IRouter<C>;
  post(path: RoutePath, handler: RouteHandler<C>): IRouter<C>;
  delete(path: RoutePath, handler: RouteHandler<C>): IRouter<C>;
  find(req: { method?: string; url?: string }): IRoute<C> | undefined;
};
export type RoutePath = string | string[];

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

/**
 * Handler
 */
export type RouteHandler<C extends object = {}> = (
  req: IRouteRequest,
  context: C,
) => Promise<IRouteResponse | undefined>;

/**
 * Request
 */
export type IRouteRequest = IncomingMessage & {
  host: string;
  params: IRouteRequestParams;
  query: IRouteRequestQuery;
  body: IRouteRequestBody;
} & IRouteRequestMethods;

export type IRouteRequestMethods = {
  header(key: string): string;
  toUrl(path: string): string;
  redirect(
    path: string,
    options?: { headers?: t.IHttpHeaders; status?: 307 | 303 },
  ): IRouteResponse;
};

export type IRouteRequestParams = { [key: string]: string | number | boolean };
export type IRouteRequestQuery = {
  [key: string]: string | number | boolean | (string | number | boolean)[];
};

/**
 * Response
 */
export type IRouteResponse = {
  status?: number;
  data?: any;
  headers?: t.IHttpHeaders;
};

/**
 * Body
 */
export type IRouteRequestBody = {
  json<T>(options?: IParseBodyJsonOptions<T>): Promise<T>;
  buffer(options?: IParseBodyBufferOptions): Promise<string | Uint8Array>; // NB: in node [Uint8Array] is a [Buffer].
  form(options?: IParseBodyFormOptions): Promise<IForm>;
};

export type IParseBodyJsonOptions<T> = { default?: T; limit?: string | number; encoding?: string };
export type IParseBodyFormOptions = { limits?: IFormLimits };
export type IParseBodyBufferOptions = {
  default?: string | Buffer;
  limit?: string | number;
  encoding?: string;
};

export type BodyParser = {
  json<T>(req: t.IncomingMessage, options?: t.IParseBodyJsonOptions<T>): Promise<T>;
  form(req: t.IncomingMessage, options?: t.IParseBodyFormOptions): Promise<IForm>;
  buffer(req: t.IncomingMessage, options?: t.IParseBodyBufferOptions): Promise<string | Uint8Array>;
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
