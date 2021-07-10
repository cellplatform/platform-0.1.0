import { Http } from '@platform/http/lib/http/Http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { constants, Schema, t, Uri, util } from '../common';
import { HttpClientCell } from './HttpClientCell';
import { HttpClientFile } from './HttpClientFile';
import { HttpClientNs } from './HttpClientNs';

function clientHeader() {
  const VERSION = constants.VERSION;
  const client = `client@${VERSION['@platform/cell.client']}`;
  const schema = `schema@${VERSION['@platform/cell.schema']}`;
  return `${client}; ${schema}`;
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
   * Determine if the given host is a live CellOS HTTP endpoint.
   */
  public static async isReachable(host: string) {
    try {
      await HttpClient.create(host).info();
      return true;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        return false;
      } else {
        throw error;
      }
    }
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

    // Setup observables.
    const before$ = http.before$.pipe(takeUntil(this.dispose$));
    const after$ = http.after$.pipe(takeUntil(this.dispose$));

    before$.subscribe((e) => e.modify.headers.merge(headers));

    // Store fields.
    this.http = http;
    this.request$ = before$;
    this.response$ = after$;
  }

  /**
   * [Fields]
   */
  public readonly origin: string;
  public readonly request$: t.IHttpClient['request$'];
  public readonly response$: t.IHttpClient['response$'];

  private readonly _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.asObservable();

  private readonly urls: t.IUrls;
  private readonly http: t.IHttp;

  /**
   * [Methods]
   */

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  public async info<T extends t.IResGetSysInfo>() {
    const http = this.http;
    const url = this.urls.sys.info.toString();
    const res = await http.get(url);
    return util.fromHttpResponse(res).toClientResponse<T>();
  }

  public ns(input: string | t.INsUri | t.ICoordUri | t.IFileUri) {
    const http = this.http;
    const urls = this.urls;
    const uri = Uri.toNs(input);
    return HttpClientNs({ uri, urls, http });
  }

  public cell(input: string | t.ICellUri) {
    const http = this.http;
    const urls = this.urls;
    const uri = Uri.cell(input);
    return HttpClientCell({ uri, urls, http });
  }

  public file(input: string | t.IFileUri) {
    const http = this.http;
    const urls = this.urls;
    const uri = Uri.file(input);
    return HttpClientFile({ uri, urls, http });
  }
}
