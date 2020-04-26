import { Subject } from 'rxjs';

import { t, TypeSystem } from '../common';
import { HttpClient } from '../HttpClient';

type ClientInput = string | number | t.IHttpClientOptions;
type Options = {
  http?: ClientInput | t.IHttpClient;
  cache?: t.IMemoryCache;
  event$?: Subject<t.TypedSheetEvent>;
};

/**
 * A strongly typed client-library for operating with a CellOS end-point.
 */
export class Client {
  public static Http = HttpClient;
  public static Type = TypeSystem;

  /**
   * Create a new HTTP client.
   */
  public static http(input?: ClientInput) {
    return Client.Http.create(input);
  }

  /**
   * Creates all the parts necessary to work with the [TypeSystem].
   */
  public static type(input?: Options | string | number) {
    const args = typeof input === 'object' ? input : { http: input };
    const { cache, event$ } = args;

    const http = HttpClient.isClient(args.http)
      ? (args.http as t.IHttpClient)
      : HttpClient.create(args.http as string);

    const fetch = TypeSystem.fetcher.fromClient(http);

    const api = {
      http,
      fetch,
      async defs(ns: string | t.INsUri) {
        return (await TypeSystem.client(http).load(ns)).defs;
      },
      async typescript(ns: string | t.INsUri) {
        const defs = await api.defs(ns);
        return TypeSystem.Client.typescript(defs);
      },
      sheet<T>(ns: string | t.INsUri) {
        return TypeSystem.Sheet.load<T>({ ns, fetch, cache, event$ });
      },
    };

    return api;
  }

  /**
   * Creates and loads a new "strongly typed" sheet.
   */
  public static sheet<T>(ns: string | t.INsUri, options?: Options) {
    return Client.type(options).sheet<T>(ns);
  }
}
