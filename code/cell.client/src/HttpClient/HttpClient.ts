import { Schema, t, http, constants, util } from '../common';
import { HttpClientCell } from './HttpClientCell';
import { HttpClientFile } from './HttpClientFile';
import { HttpClientNs } from './HttpClientNs';

function clientHeader() {
  const VERSION = constants.VERSION;
  const client = `client@${VERSION['@platform/cell.client']}`;
  const schema = `schema@${VERSION['@platform/cell.schema']}`;
  return `CellOS; ${client}; ${schema}`;
}

/**
 * An HTTP client for the CellOS.
 */
export class HttpClient implements t.IHttpClient {
  public static create(host?: string | number): t.IHttpClient {
    return new HttpClient({ host });
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
  public readonly request$: t.IHttpClient['request$'];
  public readonly response$: t.IHttpClient['response$'];

  private readonly urls: t.IUrls;
  private readonly http: t.IHttp;

  /**
   * [Methods]
   */

  public async info<T extends t.IResGetSysInfo>() {
    const http = this.http;
    const url = this.urls.sys.info.toString();

    const res = await http.get(url);
    return util.fromHttpResponse(res).toClientResponse<T>();
  }

  public ns(input: string | t.IUrlParamsNs) {
    const urls = this.urls;
    const uri = urls.ns(input).uri;
    const http = this.http;
    return HttpClientNs.create({ uri, urls, http });
  }

  public cell(input: string | t.IUrlParamsCell) {
    const urls = this.urls;
    const uri = urls.cell(input).uri;
    const http = this.http;
    return HttpClientCell.create({ uri, urls, http });
  }

  public file(input: string | t.IUrlParamsFile) {
    const urls = this.urls;
    const uri = urls.file(input).uri;
    const http = this.http;
    return HttpClientFile.create({ uri, urls, http });
  }
}
