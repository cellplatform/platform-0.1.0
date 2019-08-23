import { IncomingMessage, ServerResponse, Server } from 'http';
import { Token } from 'path-to-regexp';

/**
 * HTTP
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type IHttpHeaders = { [key: string]: string };

/**
 * Router
 */
export type Request = IncomingMessage & { params: { [key: string]: string } };
export type Response = ServerResponse;

export type RequestHandler = (req: Request, res: Response) => any;
export type RouteHandler = (req: Request) => Promise<RouteResponse | undefined>;
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
