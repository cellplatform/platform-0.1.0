import { parse as parseUrl } from 'url';
import { t, pathToRegex } from '../common';
import * as body from '../body';

export class Router implements t.IRouter {
  /**
   * [Static]
   */
  public static params(args: { route: t.IRoute; url: string }) {
    const { route, url } = args;
    const { tokens, regex } = route;
    const parts = regex.exec(url) || [];
    return tokens.reduce((acc, next, i) => {
      if (typeof next === 'object') {
        acc[next.name] = parts[i];
      }
      return acc;
    }, {});
  }

  /**
   * [Lifecycle]
   */
  public static create = () => new Router();
  private constructor() {}

  /**
   * [Fields]
   */
  public routes: t.IRoute[] = [];

  public handler: t.RouteHandler = async incoming => {
    const route = this.find(incoming) as t.IRoute;
    if (!route) {
      return { status: 404, data: { status: 404, message: 'Not found.' } };
    }

    const req = {
      ...incoming,
      get params() {
        const url = incoming.url || '';
        return Router.params({ route, url });
      },
      get body() {
        return {
          async json<T>(options: { default?: T; limit?: string | number; encoding?: string } = {}) {
            return body.json(incoming, { ...options });
          },
        };
      },
    };

    return route.handler(req as t.Request);
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

    // Lazy create path pattern matchers.
    let regex: RegExp | undefined;
    let tokens: t.Token[] | undefined;

    const route: t.IRoute = {
      method,
      path,
      handler,
      get regex() {
        return regex ? regex : (regex = pathToRegex(path));
      },
      get tokens() {
        return tokens ? tokens : (tokens = pathToRegex.parse(path));
      },
    };
    this.routes = [...this.routes, route];
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
