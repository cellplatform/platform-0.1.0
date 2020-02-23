import { parse as pathToTokens, pathToRegexp } from 'path-to-regexp';
import { parse as parseUrl } from 'url';

import { createBody } from './body';
import { t } from '../common';
import * as parse from '../parse';

export class Router<C extends object = {}> implements t.IRouter<C> {
  /**
   * [Static]
   */
  public static params = parse.params;
  public static query = parse.query;

  /**
   * [Lifecycle]
   */
  public static create<C extends object = {}>(args: t.IRouterArgs): t.IRouter<C> {
    return new Router<C>(args);
  }

  private constructor(args: t.IRouterArgs) {
    this.args = args;
  }

  /**
   * [Fields]
   */
  private readonly args: t.IRouterArgs;
  public routes: t.IRoute[] = [];

  /**
   * [Properties]
   */
  public get wildcard() {
    return this.routes.find(route => route.path === '*');
  }

  /**
   * [Methods]
   */
  public handler: t.RouteHandler<C> = async (incoming, ctx) => {
    try {
      const route = this.find(incoming) as t.IRoute;
      if (!route) {
        return { status: 404, data: { status: 404, message: 'Not found.' } };
      }

      // Append helpers peoperties to the request.
      let params: t.RequestParams | undefined;
      let query: t.RequestQuery | undefined;
      const path = incoming.url || '';
      const host = (incoming.headers as any).host || '';

      const body = createBody(incoming, this.args.bodyParser);

      const helpers = {
        host,
        body,
        get params() {
          if (!params) {
            params = Router.params<t.RequestParams>({ route, path });
          }
          return params;
        },

        get query() {
          if (!query) {
            query = Router.query<t.RequestQuery>({ path });
          }
          return query;
        },

        header(key: string) {
          key = key.toLowerCase();
          const headers = incoming.headers;
          const matches = Object.keys(headers).filter(headerKey => headerKey.toLowerCase() === key);
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
          options: { headers?: t.IHttpHeaders; status?: 307 | 303 } = {},
        ): t.RouteResponse {
          return {
            status: options.status || 307,
            data: helpers.toUrl(path),
            headers: options.headers,
          };
        },
      };

      const request = Object.assign(incoming, helpers) as t.HttpRequest; // tslint:disable-line

      return route.handler(request, ctx);
    } catch (err) {
      const url = incoming.url;
      const message = `Failed while finding handler for url "${url}". ${err.message}`;
      throw new Error(message);
    }
  };

  public add(method: t.HttpMethod, path: t.IRoutePath, handler: t.RouteHandler<C>) {
    const paths = Array.isArray(path) ? path : [path];
    paths.forEach(path => this._add(method, path, handler));
    return this;
  }

  private _add(method: t.HttpMethod, path: string, handler: t.RouteHandler<C>) {
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
        const pattern = path === '*' ? /.*/ : path; // NB: Match anything if wildcard ("*").
        regex = pathToRegexp(pattern, keys);
      }
    };

    const route: t.IRoute<any> = {
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

  public get = (path: t.IRoutePath, handler: t.RouteHandler<C>) => this.add('GET', path, handler);
  public put = (path: t.IRoutePath, handler: t.RouteHandler<C>) => this.add('PUT', path, handler);
  public post = (path: t.IRoutePath, handler: t.RouteHandler<C>) => this.add('POST', path, handler);
  public delete = (path: t.IRoutePath, handler: t.RouteHandler<C>) =>
    this.add('DELETE', path, handler);

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
