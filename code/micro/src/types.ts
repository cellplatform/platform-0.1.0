import { IncomingMessage, ServerResponse, Server } from 'http';

/**
 * HTTP
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type IHttpHeaders = { [key: string]: string };

/**
 * Router
 */
export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => any;
export type RouteHandler = (req: IncomingMessage) => Promise<RouteResponse | undefined>;
export type RouteResponse = {
  status?: number;
  data?: any;
  headers?: IHttpHeaders;
};
export type IRoute = {
  method: HttpMethod;
  path: string;
  regex: RegExp;
  handler: RouteHandler;
};

export type IRouter = {
  routes: IRoute[];
  handler: RouteHandler;
  wildcard: IRoute | undefined;
  add(method: HttpMethod, path: string, handler: RouteHandler): IRouter;
  get(path: string, handler: RouteHandler): IRouter;
  put(path: string, handler: RouteHandler): IRouter;
  post(path: string, handler: RouteHandler): IRouter;
  delete(path: string, handler: RouteHandler): IRouter;
  find(req: { method?: string; url?: string }): IRoute | undefined;
};

/**
 * Server
 */
export type ILogProps = { [key: string]: string | number | boolean };

export type Listen = (options?: {
  port?: number;
  log?: ILogProps;
  silent?: boolean;
}) => Promise<IMicro>;

export type IMicro = {
  listen: Listen;
  server: Server;
  router: IRouter;
  handler: RequestHandler;
};
