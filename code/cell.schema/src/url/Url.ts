import { R, t } from '../common';
import { Uri } from '../uri';
import { UrlPath } from './UrlPath';
import * as util from './util';
import { ROUTES } from './ROUTES';

/**
 * Standardised construction of URLs for the HTTP service.
 */
export class Url {
  public static readonly uri = Uri;
  public static readonly routes = ROUTES;

  public static parse(input?: string) {
    input = (input || '').trim() || 'localhost';
    const host = R.pipe(util.stripHttp, util.stripSlash, util.stripPort)(input);
    const protocol = util.toProtocol(host);
    const port = util.toPort(input) || 80;
    const origin = port === 80 ? `${protocol}://${host}` : `${protocol}://${host}:${port}`;
    return { protocol, host, port, origin };
  }

  /**
   * [Lifecycle]
   */
  constructor(input?: string) {
    const { protocol, host, port, origin } = Url.parse(input);
    this.host = host;
    this.protocol = protocol;
    this.port = port;
    this.origin = origin;
  }

  /**
   * [Fields]
   */
  public readonly protocol: t.HttpProtocol;
  public readonly host: string;
  public readonly port: number;
  public readonly origin: string;

  /**
   * [Methods]
   */
  public ns(id: string) {
    const toPath = this.toPath;
    return {
      get base() {
        return toPath<t.IUrlQueryNs>(`/ns:${id}`);
      },
    };
  }

  /**
   * [Internal]
   */
  private toPath = <Q extends object>(path: string, options: { query?: Q } = {}) => {
    const { query } = options;
    return new UrlPath<Q>({ origin: this.origin, path, query });
  };
}
