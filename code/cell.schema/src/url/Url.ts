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
    if (id.includes(':')) {
      const uri = Uri.parse(id);
      const type = uri.parts.type;

      if (uri.error) {
        throw new Error(uri.error.message);
      }

      if (type === 'ns') {
        id = (uri.parts as t.INsUri).id;
      } else if (type === 'cell') {
        id = (uri.parts as t.ICellUri).ns;
      } else {
        const err = `The id for the namespace is a URI, but not of type "ns:" or "cell:" ("${id}")`;
        throw new Error(err);
      }
    }

    return {
      get base() {
        return toPath<t.IUrlQueryNs>(`/ns:${id}`);
      },
    };
  }

  public cell(uri: string) {
    const toPath = this.toPath;

    const cell = Uri.parse(uri);
    if (cell.error) {
      throw new Error(cell.error.message);
    }

    const parts = cell.parts as t.ICellUri;
    if (parts.type !== 'cell') {
      const err = `The given URI is not of type "cell:" ("${uri}")`;
      throw new Error(err);
    }

    return {
      get base() {
        return toPath<t.IUrlQueryCell>(`/cell:${parts.ns}!${parts.key}`);
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
