import { t, defaultValue, R, value } from '../common';
import * as util from './util';

/**
 * Represents a URL path that can be converted to a proper URL via `toString()`.
 */
export class Url<Q extends Record<string, unknown> = any> implements t.IUrl<Q> {
  public static isLocal = util.isLocal;

  /**
   * Parses an input into it's constituent URL parts.
   */
  public static parse(input?: string | number) {
    input = value.isNumeric(input) ? `localhost:${input}` : input?.toString();
    let text = (input || '').trim();
    text = text || 'localhost';

    const hostname = R.pipe(util.stripHttp, util.stripSlash, util.stripPort)(text);
    const protocol = util.toProtocol(hostname);
    const port = util.toPort(text) || 80;
    const host = port === 80 ? hostname : `${hostname}:${port}`;

    const origin: t.IUrlOrigin = {
      protocol,
      hostname,
      host,
      port,
      toString: () => `${protocol}://${host}`,
    };

    return { origin };
  }

  /**
   * [Lifecycle]
   */
  constructor(args: { origin: string; path?: string; query?: Partial<Q>; querystring?: string }) {
    this.origin = Url.parse(args.origin).origin;
    this.path = `/${(args.path || '').trim().replace(/^\/*/, '')}`;
    this._query = args.query || {};
    this._querystring = typeof args.querystring === 'string' ? args.querystring.trim() : '';
  }

  /**
   * [Fields]
   */
  private _query = {} as Partial<Q>;
  private _querystring = '';

  public readonly origin: t.IUrlOrigin;
  public readonly path: string;

  /**
   * [Properties]
   */
  public get querystring(): string {
    const text = (this._querystring || '').replace(/^\?*/, '');
    const query = this._query || {};
    let res = '';

    const format = (value: any) => {
      value = typeof value === 'string' ? value.trim() : value;
      return value;
    };

    const append = (key: string, value?: string) => {
      res = res ? `${res}&` : res;
      res = value === undefined ? `${res}${key}` : `${res}${key}=${value}`;
    };

    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (typeof value !== 'function' && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          const values = value.map((value) => format(value));
          R.uniq(values).forEach((value) => append(key, value));
        } else {
          append(key, format(value));
        }
      }
    });

    if (text) {
      res = res ? `${res}&${text}` : text;
    }

    return res ? `?${res}` : '';
  }

  /**
   * [Methods]
   */
  public query(input: Partial<Q>) {
    const querystring = this._querystring || '';
    let query = this._query || {};
    if (typeof input === 'object') {
      query = { ...query, ...input };
    }
    return new Url({
      origin: this.origin.toString(),
      path: this.path,
      query,
      querystring,
    });
  }

  public toString(options: { origin?: boolean } = {}) {
    const origin = defaultValue(options.origin, true);
    const path = `${this.path}${this.querystring}`;
    return origin ? `${this.origin}${path}` : path;
  }
}
