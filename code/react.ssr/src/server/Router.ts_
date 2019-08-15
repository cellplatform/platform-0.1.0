import { parse as parseUrl } from 'url';
import { t, pathToRegex } from '../common';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type IRoute = {
  method: HttpMethod;
  path: string;
  regex: RegExp;
  handler: t.RouteHandler;
};

export class Router {
  /**
   * [Lifecycle]
   */
  public static create = () => new Router();
  private constructor() {}

  /**
   * [Fields]
   */
  public routes: IRoute[] = [];

  public handler: t.RouteHandler = async req => {
    const match = this.find(req);
    return match
      ? match.handler(req)
      : { status: 404, data: { status: 404, description: 'Not found.' } };
  };

  /**
   * [Properties]
   */
  public get wildcard() {
    return this.routes.find(route => route.path === '*');
  }

  /**
   * [Methods]
   */
  public add(method: HttpMethod, path: string, handler: t.RouteHandler) {
    const regex = pathToRegex(path);
    this.routes = [...this.routes, { method, path, regex, handler }];
    return this;
  }
  public get = (path: string, handler: t.RouteHandler) => this.add('GET', path, handler);
  public put = (path: string, handler: t.RouteHandler) => this.add('PUT', path, handler);
  public post = (path: string, handler: t.RouteHandler) => this.add('POST', path, handler);
  public delete = (path: string, handler: t.RouteHandler) => this.add('DELETE', path, handler);

  public find(req: t.IncomingMessage) {
    const route = this.routes.find(route => {
      return req.method === route.method && route.regex.test(toPath(req.url));
    });
    return route || this.wildcard;
  }
}

/**
 * [Helpers]
 */
const toPath = (url?: string) => parseUrl(url || '', false).pathname || '';
