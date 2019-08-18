import { IncomingMessage, ServerResponse } from 'http';

export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => any;

export type RouteHandler = (req: IncomingMessage) => Promise<RouteResponse | undefined>;
export type RouteResponse = {
  status?: number;
  data?: any;
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type IRoute = {
  method: HttpMethod;
  path: string;
  regex: RegExp;
  handler: RouteHandler;
};
