import { TypeSystem } from '../common';
import { HttpClient } from '../HttpClient';
import * as t from './types';

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
