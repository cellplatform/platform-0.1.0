import { parse as parseUrl } from 'url';
import { t, value } from '../common';
import * as body from '../body';

import { pathToRegexp, parse as pathToTokens } from 'path-to-regexp';

export class Router implements t.IRouter {
  /**
   * [Static]
   */
  public static params<T extends object>(args: { route: t.IRoute; path: string }): Partial<T> {
    const { route } = args;
    const { regex, keys } = route;
    const path = normalizePathname((args.path || '').split('?')[0]);

    const parts = regex.exec(path) || [];
    if (parts.length === 0) {
      return {};
    }

    const res = keys.reduce((acc, key, i) => {
      acc[key.name] = value.toType(parts[i + 1]);
      return acc;
    }, {});

    return value.deleteUndefined(res);
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

      // TODO - query

      get params() {
        const url = incoming.url || '';
        return Router.params({ route, path: url });
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

    // Lazily create path pattern matchers.
    let regex: RegExp | undefined;
    let tokens: t.Token[] | undefined;
    const keys: t.Key[] = [];

    const parse = () => {
      if (!regex) {
        regex = pathToRegexp(path, keys);
      }
    };

    const route: t.IRoute = {
      method,
      path,
      handler,
      get regex() {
        parse();
        return regex as RegExp;
      },
      get keys() {
        parse();
        return keys;
      },
      get tokens() {
        return tokens ? tokens : (tokens = pathToTokens(path));
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

/**
 * Normalize a pathname for matching, replaces multiple slashes with a single
 * slash and normalizes unicode characters to "NFC". When using this method,
 * `decode` should be an identity function so you don't decode strings twice.
 *
 * See:
 *    https://github.com/pillarjs/path-to-regexp#normalize-pathname
 *
 */
const normalizePathname = (pathname: string) => {
  return (
    decodeURI(pathname)
      // Replaces repeated slashes in the URL.
      .replace(/\/+/g, '/')
      // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
      // Note: Missing native IE support, may want to skip this step.
      .normalize()
  );
};
