import { TypeSystem } from '../common';
import { HttpClient } from '../Client.HttpClient';
import * as t from './types';

type N = string | t.INsUri;

/**
 * Access point for working with the TypeSystem.
 */
export function typesystem(input?: t.ClientOptions | string | number) {
  const args = typeof input === 'object' ? input : { http: input };
  const { cache, event$ } = args;

  const http = HttpClient.isClient(args.http)
    ? (args.http as t.IHttpClient)
    : HttpClient.create(args.http as string);

  const fetch = TypeSystem.fetcher.fromClient(http);

  const api = {
    http,
    fetch,

    /**
     * Retrieves the type-definitions for the given namespace(s).
     */
    async defs(ns: N | N[]) {
      const uris = Array.isArray(ns) ? ns : [ns];
      const client = TypeSystem.client(http);
      const defs = (await Promise.all(uris.map(ns => client.load(ns)))).map(({ defs }) => defs);
      return defs.reduce((acc, next) => acc.concat(next), []); // Flatten.
    },

    /**
     * Typescript generator for the given namespace(s).
     */
    async typescript(ns: N | N[]) {
      const defs = await api.defs(ns);
      return TypeSystem.Client.typescript(defs);
    },

    /**
     * Retrieve the strongly-typed sheet at the given namespace.
     */
    sheet<T>(ns: string | t.INsUri) {
      return TypeSystem.Sheet.load<T>({ ns, fetch, cache, event$ });
    },
  };

  return api;
}
