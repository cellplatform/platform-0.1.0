import { Subject } from 'rxjs';

import { t, TypeSystem } from '../common';
import { HttpClient } from '../HttpClient';

type ClientInput = string | number | t.IHttpClientOptions;
type Options = {
  client?: ClientInput | t.IHttpClient;
  cache?: t.IMemoryCache;
  events$?: Subject<t.TypedSheetEvent>;
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
  public static type(args: Options = {}) {
    const { cache, events$ } = args;

    const http = HttpClient.isClient(args.client)
      ? (args.client as t.IHttpClient)
      : HttpClient.create(args.client as string);

    const fetch = TypeSystem.fetcher.fromClient(http);

    const api = {
      http,
      fetch,
      def(ns: string | t.INsUri) {
        return TypeSystem.client(http).load(ns);
      },
      async typescript(ns: string | t.INsUri) {
        return TypeSystem.Client.typescript(await api.def(ns));
      },
      sheet<T>(ns: string | t.INsUri) {
        return TypeSystem.Sheet.load<T>({ ns, fetch, cache, events$ });
      },
    };

    return api;
  }

  /**
   * Creates and loads a new "strongly typed" sheet.
   */
  public static sheet<T>(ns: string | t.INsUri, options: Options) {
    return Client.type(options).sheet<T>(ns);
  }
}
