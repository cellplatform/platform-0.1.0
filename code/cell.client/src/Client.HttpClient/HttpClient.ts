import { Schema, t, Http, constants, util } from '../common';
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
  public static create(input?: string | number | t.IHttpClientOptions): t.IHttpClient {
    const args = typeof input === 'object' ? input : { host: input };
    return new HttpClient(args);
  }

  /**
   * Determine if the given input is an [IHttpClient].
   */
  public static isClient(input?: any) {
    if (typeof input !== 'object' || input === null) {
      return false;
    }

    const value = input as t.IHttpClient;
    return (
      util.isObservable(value.request$) &&
      util.isObservable(value.response$) &&
      typeof value.origin === 'string' &&
      typeof value.info === 'function' &&
      typeof value.ns === 'function' &&
      typeof value.cell === 'function' &&
      typeof value.file === 'function'
    );
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: t.IHttpClientOptions) {
    this.urls = Schema.urls(args.host ?? 8080);
    this.origin = this.urls.origin;

    // Create the HTTP client.
    const headers = { client: clientHeader() };
    const http = args.http ? args.http : Http.create({ headers, mode: 'cors' });
    http.before$.subscribe(e => e.modify.headers.merge(headers));

    // Store fields.
    this.http = http;
    this.request$ = http.before$;
    this.response$ = http.after$;
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
