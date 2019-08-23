import { parse as parseUrl } from 'url';
import { t, pathToRegex } from '../common';

export class Router implements t.IRouter {
  /**
   * [Lifecycle]
   */
  public static create = () => new Router();
  private constructor() {}

  /**
   * [Fields]
   */
  public routes: t.IRoute[] = [];

  public handler: t.RouteHandler = async req => {
    const match = this.find(req);
    return match
      ? match.handler(req)
      : { status: 404, data: { status: 404, message: 'Not found.' } };
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
  public add(method: t.HttpMethod, path: string, handler: t.RouteHandler) {
    const exists = this.routes.find(route => route.method === method && route.path === path);
    if (exists) {
      throw new Error(`A ${method} route for path '${path}' already exists.`);
    }
    const regex = pathToRegex(path);
    this.routes = [...this.routes, { method, path, regex, handler }];
    return this;
  }
  public get = (path: string, handler: t.RouteHandler) => this.add('GET', path, handler);
  public put = (path: string, handler: t.RouteHandler) => this.add('PUT', path, handler);
  public post = (path: string, handler: t.RouteHandler) => this.add('POST', path, handler);
  public delete = (path: string, handler: t.RouteHandler) => this.add('DELETE', path, handler);

  /**
   * Find the route at the given url.
   */
  public find(req: { method?: string; url?: string }) {
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
