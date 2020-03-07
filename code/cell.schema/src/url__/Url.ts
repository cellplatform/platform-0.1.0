import { t, defaultValue, R } from '../common';

/**
 * Represents a URL path that can be converted to a proper URL via `toString()`.
 */
export class Url<Q extends object = {}> implements t.IUrl<Q> {
  /**
   * [Lifecycle]
   */
  constructor(args: { origin: string; path?: string; query?: Partial<Q>; querystring?: string }) {
    this.origin = (args.origin || '').trim().replace(/\/*$/, '');
    this.path = `/${(args.path || '').trim().replace(/^\/*/, '')}`;
    this._.query = args.query || {};
    this._.querystring = typeof args.querystring === 'string' ? args.querystring.trim() : '';
  }

  /**
   * [Fields]
   */
  public readonly origin: string;
  public readonly path: string;
  private readonly _ = {
    query: ({} as unknown) as Partial<Q>,
    querystring: '',
  };

  /**
   * [Properties]
   */
  public get querystring(): string {
    const text = (this._.querystring || '').replace(/^\?*/, '');
    const query = this._.query || {};
    let res = '';

    const format = (value: any) => {
      value = typeof value === 'string' ? value.trim() : value;
      return value;
    };

    const append = (key: string, value?: string) => {
      res = res ? `${res}&` : res;
      res = value === undefined ? `${res}${key}` : `${res}${key}=${value}`;
    };

    Object.keys(query).forEach(key => {
      const value = query[key];
      if (typeof value !== 'function' && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          const values = value.map(value => format(value));
          R.uniq(values).forEach(value => append(key, value));
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
    const querystring = this._.querystring || '';
    let query = this._.query || {};
    if (typeof input === 'object') {
      query = { ...query, ...input };
    }
    return new Url({
      origin: this.origin,
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
