import { Subject } from 'rxjs';

import { HttpClient } from '../Client.http';
import { MemoryCache, t, TypeSystem, value, Uri } from '../common';
import { saveChanges } from './typesystem.saveChanges';

type N = string | t.INsUri;
type E = t.TypedSheetEvent;

/**
 * Access point for working with the TypeSystem.
 */
export function typesystem(input?: t.ClientTypesystemOptions | string | number) {
  const args = typeof input === 'object' ? input : { http: input };
  const event$ = args.event$ ? (args.event$ as Subject<E>) : undefined;
  const cache = args.cache || MemoryCache.create();
  const pool = args.pool || TypeSystem.Pool.create();

  let changeMonitor: t.ITypedSheetChangeMonitor | undefined;

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
      return changeMonitor || (changeMonitor = TypeSystem.ChangeMonitor.create());
    },

    /**
     * Retrieves the type-definitions for the given namespace(s).
     */
    async typeDefs(ns: N | N[]) {
      const uris = Array.isArray(ns) ? ns : [ns];
      const client = TypeSystem.client(fetch);
      const defs = (await Promise.all(uris.map((ns) => client.load(ns)))).map(({ defs }) => defs);
      return defs.reduce((acc, next) => acc.concat(next), []); // NB: Flatten [][] => [].
    },

    /**
     * Retrieves type-definitions for the implented namespace.
     */
    async implements(ns: N) {
      const client = http.ns(ns);
      const res = await client.read({ data: false });

      const defaultError: t.IHttpErrorType = {
        status: res.status,
        type: 'HTTP/type',
        message: `Failed to retrieve implementing type for [${ns.toString()}]`,
      };
      const error = res.ok ? undefined : res.error ? res.error : defaultError;

      const { body } = res;
      const type = body.data.ns.props?.type || {};
      const typeDefs = error || !type.implements ? [] : await api.typeDefs(type.implements);

      return value.deleteUndefined({
        ns: client.uri.toString(),
        implements: type.implements ? Uri.toNs(type.implements).toString() : '',
        typeDefs,
        error,
      });
    },

    /**
     * Typescript generator for the given namespace(s).
     */
    async typescript(ns: N | N[], options: t.ITypeClientTypescriptOptions = {}) {
      const defs = await api.typeDefs(ns);
      return TypeSystem.Client.typescript(defs, options);
    },

    /**
     * Retrieve the strongly-typed sheet at the given namespace.
     */
    sheet<T>(ns: N) {
      return TypeSystem.Sheet.load<T>({ ns, fetch, cache, event$, pool });
    },

    /**
     * Writes changes to the server.
     */
    saveChanges(sheet: t.ITypedSheet, options: { fire?: t.FireEvent<E> | Subject<E> } = {}) {
      const { fire } = options;
      return saveChanges({ http, sheet, fire });
    },
  };

  return api;
}
