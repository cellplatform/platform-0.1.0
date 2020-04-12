import { Subject } from 'rxjs';

import { t, TypeSystem } from '../common';
import { HttpClient } from '../HttpClient';

/**
 * A strongly typed client-library for operating with a CellOS end-point.
 */
export class Client {
  public static Http = HttpClient;
  public static Type = TypeSystem;

  /**
   * Creates all the parts necessary to work with the [TypeSystem].
   */
  public static type(
    args: {
      client?: string | number | t.IHttpClientOptions | t.IHttpClient;
      cache?: t.IMemoryCache;
      events$?: Subject<t.TypedSheetEvent>;
    } = {},
  ) {
    const { cache, events$ } = args;

    const http = HttpClient.isClient(args.client)
      ? (args.client as t.IHttpClient)
      : HttpClient.create(args.client as string);

    const fetch = TypeSystem.fetcher.fromClient(http);

    return {
      http,
      fetch,
      sheet<T>(ns: string | t.INsUri) {
        return TypeSystem.Sheet.load<T>({ ns, fetch, cache, events$ });
      },
    };
  }

  /**
   * Creates and loads a new "strongly typed" sheet.
   */
  public static sheet<T>(
    ns: string | t.INsUri,
    options: {
      client?: string | number | t.IHttpClientOptions | t.IHttpClient;
      cache?: t.IMemoryCache;
      events$?: Subject<t.TypedSheetEvent>;
    },
  ) {
    return Client.type(options).sheet<T>(ns);
  }
}
