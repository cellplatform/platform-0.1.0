import { parse as pathToTokens, pathToRegexp } from 'path-to-regexp';
import * as querystring from 'querystring';
import { parse as parseUrl } from 'url';

import * as body from '../body';
import { t, value, log, methodColor } from '../common';

export class Router implements t.IRouter {
  /**
   * [Static]
   */

  /**
   * Parse URL parameters.
   */
  public static params<T extends object>(args: { route: t.IRoute; path: string }): T {
    const { route } = args;
    const { regex, keys } = route;

    const path = normalizePathname((args.path || '').split('?')[0]);
    const parts = regex.exec(path) || [];

    const res = keys.reduce((acc, key, i) => {
      acc[key.name] = value.toType(parts[i + 1]);
      return acc;
    }, {});

    return value.deleteUndefined(res) as T;
  }

  /**
   * Parse a query string.
   */
  public static query<T extends object>(args: { path: string }): T {
    const { path = '' } = args;
    const index = path.indexOf('?');
    const toString = () => (index < 0 ? '' : path.substring(index) || '');

    if (index < 0) {
      const empty = { toString };
      return empty as T;
    }

    const parseType = (input: any) => {
      input = input === '' ? true : input; // NB: existence of key into flag, eg: `/foo?q` => `/foo?q=true`
      return value.toType(input);
    };

    const query: any = querystring.parse(toString().replace(/^\?/, ''));
    Object.keys(query).forEach(key => {
      const value = query[key];
      query[key] = Array.isArray(value) ? value.map(item => parseType(item)) : parseType(value);
    });

    const res = {
      ...query, // NB: Ensure a simple object is returned.
      toString,
    };
    return res as T;
  }

  /**
   * [Lifecycle]
   */
  public static create = (): t.IRouter => new Router();
  private constructor() {}

  /**
   * [Fields]
   */
  public routes: t.IRoute[] = [];

  public handler: t.RouteHandler = async (incoming, ctx) => {
    try {
      const route = this.find(incoming) as t.IRoute;
      if (!route) {
        return { status: 404, data: { status: 404, message: 'Not found.' } };
      }

      // Append helpers peoperties to the request.
      let params: t.RequestParams | undefined;
      let query: t.RequestQuery | undefined;
      const path = incoming.url || '';
      const host = incoming.headers.host || '';
      const helpers = {
        host,
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

        get body() {
          return {
            async json<T>(options: t.IBodyJsonOptions<T> = {}) {
              return body.json(incoming, { ...options });
            },
            async buffer(options: t.IBodyBufferOptions = {}) {
              return body.buffer(incoming, { ...options });
            },
            async form(options: t.IBodyFormOptions = {}) {
              return body.form(incoming, { ...options });
            },
          };
        },

        toUrl(path: string) {
          path = path || '';
          if (path.startsWith('https://') || path.startsWith('http://')) {
            return path;
          }
          const prefix = host.startsWith('localhost') ? 'http' : 'https';
          return `${prefix}://${host}/${path.replace(/^\/*/, '')}`;
        },

        redirect(path: string, options: { headers?: t.IHttpHeaders } = {}): t.RouteResponse {
          return {
            status: 307,
            data: helpers.toUrl(path),
            headers: options.headers,
          };
        },
      };

      const request = Object.assign(incoming, helpers) as t.Request; // tslint:disable-line

      return route.handler(request, ctx);
    } catch (err) {
      const url = incoming.url;
      const message = `Failed while finding handler for url "${url}". ${err.message}`;
      throw new Error(message);
    }
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
  public add(method: t.HttpMethod, path: t.IRoutePath, handler: t.RouteHandler) {
    const paths = Array.isArray(path) ? path : [path];
    paths.forEach(path => this._add(method, path, handler));
    return this;
  }

  private _add(method: t.HttpMethod, path: string, handler: t.RouteHandler) {
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

  public get = (path: t.IRoutePath, handler: t.RouteHandler) => this.add('GET', path, handler);
  public put = (path: t.IRoutePath, handler: t.RouteHandler) => this.add('PUT', path, handler);
  public post = (path: t.IRoutePath, handler: t.RouteHandler) => this.add('POST', path, handler);
  public delete = (path: t.IRoutePath, handler: t.RouteHandler) =>
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

  /**
   * Creates a console loggable table of the routes.
   */
  public log(options: { indent?: number } = {}) {
    const table = log.table({ border: false });
    const gray = log.gray;
    const prefix = ' '.repeat(Math.max(0, options.indent || 0));

    this.routes.forEach(route => {
      const method = methodColor(route.method)(route.method);
      const pattern = gray(`${route.path}`);

      let line: string[] = [];
      line = prefix ? [...line, prefix.substring(1)] : line;
      line = [...line, `${method} `, pattern];

      table.add(line);
    });

    return table.toString();
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
