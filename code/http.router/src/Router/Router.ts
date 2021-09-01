import { parse as pathToTokens, pathToRegexp } from 'path-to-regexp';

import { createBody } from './body';
import { t, Url } from '../common';
import * as parse from '../parse';

type P = t.RoutePath;
type O = Record<string, unknown>;

export class Router<C extends O = any> implements t.Router<C> {
  /**
   * [Static]
   */
  public static params = parse.params;
  public static query = parse.query;

  /**
   * [Lifecycle]
   */
  public static create<C extends O = any>(args: t.RouterArgs): t.Router<C> {
    return new Router<C>(args);
  }

  private constructor(args: t.RouterArgs) {
    this.args = args;
  }

  /**
   * [Fields]
   */
  private readonly args: t.RouterArgs;
  private _wildcard: t.Route<C> | undefined;
  public routes: t.Route[] = [];

  /**
   * [Methods]
   */
  public handler: t.RouteHandler<C> = async (incoming, ctx) => {
    try {
      const route = this.find(incoming) as t.Route;
      if (!route) {
        return { status: 404, data: { status: 404, message: 'Not found.' } };
      }

      // Append helpers peoperties to the request.
      let params: t.RouteRequestParams | undefined;
      let query: t.RouteRequestQuery | undefined;
      const path = incoming.url || '';
      const host = (incoming.headers as any).host || '';
      const body = createBody(incoming, this.args.body);

      const helpers = {
        host,
        body,
        get params() {
          if (!params) {
            params = Router.params<t.RouteRequestParams>({ route, path });
          }
          return params;
        },

        get query() {
          if (!query) {
            query = Router.query<t.RouteRequestQuery>({ path });
          }
          return query;
        },

        header(key: string) {
          key = key.toLowerCase();
          const headers = incoming.headers;
          const matches = Object.keys(headers).filter(
            (headerKey) => headerKey.toLowerCase() === key,
          );
          const value = matches[0] ? headers[matches[0]] : '';
          return value?.toString() || '';
        },

        toUrl(path: string) {
          path = path || '';
          if (path.startsWith('https://') || path.startsWith('http://')) {
            return path;
          }
          const prefix = host.startsWith('localhost') ? 'http' : 'https';
          return `${prefix}://${host}/${path.replace(/^\/*/, '')}`;
        },

        redirect(
          path: string,
          options: { headers?: t.HttpHeaders; status?: 307 | 303 } = {},
        ): t.RouteResponse {
          return {
            status: options.status || 307,
            data: helpers.toUrl(path),
            headers: options.headers,
          };
        },
      };

      const request = Object.assign(incoming, helpers) as t.RouteRequest; // eslint-disable-line

      return route.handler(request, ctx);
    } catch (err: any) {
      const url = incoming.url;
      const message = `Failed while finding handler for url "${url}". ${err.message}`;
      throw new Error(message);
    }
  };

  public add(method: t.HttpMethod, path: t.RoutePath, handler: t.RouteHandler<C>) {
    const paths = Array.isArray(path) ? path : [path];
    paths.forEach((path) => {
      const route = this.toRoute(method, path, handler);
      this.routes = [...this.routes, route];
    });
    return this;
  }

  private toRoute(method: t.HttpMethod, path: string, handler: t.RouteHandler<C>) {
    const exists = this.routes.find((route) => route.method === method && route.path === path);
    if (exists) {
      throw new Error(`A ${method} route for path '${path}' already exists.`);
    }

    // Lazily create path pattern matchers.
    let regex: RegExp | undefined;
    let tokens: t.Token[] | undefined;
    const keys: t.Key[] = [];

    const parse = () => {
      if (!regex) {
        const pattern = path === '*' ? /.*/ : path; // NB: Match anything if wildcard ("*").
        regex = pathToRegexp(pattern, keys);
      }
    };

    const route: t.Route<any> = {
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

    return route;
  }

  public get = (path: P, handler: t.RouteHandler<C>) => this.add('GET', path, handler);
  public put = (path: P, handler: t.RouteHandler<C>) => this.add('PUT', path, handler);
  public post = (path: P, handler: t.RouteHandler<C>) => this.add('POST', path, handler);
  public delete = (path: P, handler: t.RouteHandler<C>) => this.add('DELETE', path, handler);
  public wildcard = (handler: t.RouteHandler<C>) => {
    this._wildcard = this.toRoute('GET', '*', handler);
    return this;
  };

  /**
   * Find the route at the given url.
   */
  public find(req: { method?: string; url?: string }) {
    const route = this.routes.find((route) => {
      return req.method === route.method && route.regex.test(Url.toPath(req.url));
    });
    return route || findWildcard(this.routes) || this._wildcard;
  }
}

/**
 * [Helpers]
 */

const findWildcard = (routes: t.Route[]) => routes.find((route) => route.path === '*');
