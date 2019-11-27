import { IncomingMessage, ServerResponse, Server } from 'http';
import { Token, Key } from 'path-to-regexp';
import { HttpMethod } from '@platform/types';

/**
 * HTTP
 */
export type IHttpHeaders = { [key: string]: string };

/**
 * Request
 */
export type Request = IncomingMessage & {
  params: RequestParams;
  query: RequestQuery;
  body: RequestBody;
};
export type RequestParams = { [key: string]: string | number | boolean };
export type RequestQuery = {
  [key: string]: string | number | boolean | Array<string | number | boolean>;
};

export type RequestBody = {
  json<T>(options?: { default?: T; limit?: string | number; encoding?: string }): Promise<T>;
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
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  regex: RegExp;
  tokens: Token[];
  keys: Key[];
};

export type IRouter = {
  routes: IRoute[];
  handler: RouteHandler;
  wildcard: IRoute | undefined;
  add(method: HttpMethod, path: IRoutePath, handler: RouteHandler): IRouter;
  get(path: IRoutePath, handler: RouteHandler): IRouter;
  put(path: IRoutePath, handler: RouteHandler): IRouter;
  post(path: IRoutePath, handler: RouteHandler): IRouter;
  delete(path: IRoutePath, handler: RouteHandler): IRouter;
  find(req: { method?: string; url?: string }): IRoute | undefined;
};

export type IRoutePath = string | string[];

/**
 * Server
 */
export type ILogProps = { [key: string]: string | number | boolean };

export type Listen = (options?: {
  port?: number;
  log?: ILogProps;
  silent?: boolean;
}) => Promise<IMicroService>;

export type IMicro = {
  server: Server;
  router: IRouter;
  handler: RequestHandler;
  listen: Listen;
};

export type IMicroService = {
  port: number;
  isRunning: boolean;
  close(): Promise<{}>;
};
