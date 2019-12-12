import { t } from '../common';

/**
 * Represents a URL path that can be converted to a proper URL via `toString()`.
 */
export class UrlPath<Q extends object = {}> {
  /**
   * [Lifecycle]
   */
  constructor(args: { origin: string; path?: string; query?: Partial<Q>; querystring?: string }) {
    this.origin = (args.origin || '').trim().replace(/\/*$/, '');
    this.path = (args.path || '').trim().replace(/^\/*/, '');
    this._.query = args.query || {};
    this._.querystring = typeof args.querystring === 'string' ? args.querystring.trim() : '';
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    query: ({} as unknown) as Partial<Q>,
    querystring: '',
  };

  public readonly origin: string;
  public readonly path: string;

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

    Object.keys(query).forEach(key => {
      let value = query[key];
      if (typeof value !== 'function') {
        res = res ? `${res}&` : res;
        value = Array.isArray(value) ? value.map(value => format(value)) : format(value);
        res = value === undefined ? `${res}${key}` : `${res}${key}=${value}`;
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
  public query(input: Partial<t.UrlQuery>) {
    const querystring = this._.querystring || '';
    let query = this._.query || {};
    if (typeof input === 'object') {
      query = { ...query, ...input };
    }
    return new UrlPath({ origin: this.origin, path: this.path, query, querystring });
  }

  public toString() {
    return `${this.origin}/${this.path}${this.querystring}`;
  }
}
