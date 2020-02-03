import { Schema, t, http, constants } from '../common';
import { ClientCell } from './ClientCell';
import { ClientFile } from './ClientFile';
import { ClientNs } from './ClientNs';

function clientHeader() {
  const VERSION = constants.VERSION;
  const client = `client@${VERSION['@platform/cell.client']}`;
  const schema = `schema@${VERSION['@platform/cell.schema']}`;
  return `CellOS; ${client}; ${schema}`;
}

/**
 * An HTTP client for the CellOS.
 */
export class Client implements t.IClient {
  public static create(host?: string | number): t.IClient {
    return new Client({ host });
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: { host?: string | number }) {
    this.urls = Schema.urls(args.host ?? 8080);
    this.origin = this.urls.origin;

    // Create the HTTP client.
    const headers = {
      client: clientHeader(),
    };
    const client = http.create({ headers, mode: 'cors' });

    // Store fields.
    this.http = client;
    this.request$ = client.before$;
    this.response$ = client.after$;
  }

  /**
   * [Fields]
   */
  public readonly origin: string;
  public readonly request$: t.IClient['request$'];
  public readonly response$: t.IClient['response$'];

  private readonly urls: t.IUrls;
  private readonly http: t.IHttp;

  /**
   * [Methods]
   */
  public ns(input: string | t.IUrlParamsNs) {
    const urls = this.urls;
    const uri = urls.ns(input).uri;
    const http = this.http;
    return ClientNs.create({ uri, urls, http });
  }

  public cell(input: string | t.IUrlParamsCell) {
    const urls = this.urls;
    const uri = urls.cell(input).uri;
    const http = this.http;
    return ClientCell.create({ uri, urls, http });
  }

  public file(input: string | t.IUrlParamsFile) {
    const urls = this.urls;
    const uri = urls.file(input).uri;
    const http = this.http;
    return ClientFile.create({ uri, urls, http });
  }
}
