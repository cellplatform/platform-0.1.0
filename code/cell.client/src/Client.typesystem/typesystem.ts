import { Subject } from 'rxjs';

import { HttpClient } from '../Client.http';
import { MemoryCache, t, TypeSystem } from '../common';

type N = string | t.INsUri;

/**
 * Access point for working with the TypeSystem.
 */
export function typesystem(input?: t.ClientTypesystemOptions | string | number) {
  const args = typeof input === 'object' ? input : { http: input };
  const event$ = args.event$ ? (args.event$ as Subject<t.TypedSheetEvent>) : undefined;
  const cache = args.cache || MemoryCache.create();
  const pool = args.pool || TypeSystem.Pool.create();

  let change: t.ITypedSheetChangeMonitor | undefined;

  const http = HttpClient.isClient(args.http)
    ? (args.http as t.IHttpClient)
    : HttpClient.create(args.http as string);

  const host = http.origin;
  const fetch = TypeSystem.Cache.wrapFetch(TypeSystem.fetcher.fromClient(http), { event$ });

  const api: t.IClientTypesystem = {
    host,
    http,
    fetch,
    cache,
    pool,

    /**
     * The singleton change-monitor for the client.
     */
    get changes() {
      return change || (change = TypeSystem.ChangeMonitor.create());
    },

    /**
     * Retrieves the type-definitions for the given namespace(s).
     */
    async defs(ns: N | N[]) {
      const uris = Array.isArray(ns) ? ns : [ns];
      const client = TypeSystem.client(fetch);
      const defs = (await Promise.all(uris.map((ns) => client.load(ns)))).map(({ defs }) => defs);
      return defs.reduce((acc, next) => acc.concat(next), []); // Flatten [][] => [].
    },

    /**
     * Typescript generator for the given namespace(s).
     */
    async typescript(
      ns: N | N[],
      options: { header?: boolean; exports?: boolean; imports?: boolean; typeIndex?: boolean } = {},
    ) {
      const defs = await api.defs(ns);
      return TypeSystem.Client.typescript(defs, options);
    },

    /**
     * Retrieve the strongly-typed sheet at the given namespace.
     */
    sheet<T>(ns: N) {
      return TypeSystem.Sheet.load<T>({ ns, fetch, cache, event$, pool });
    },
  };

  return api;
}
