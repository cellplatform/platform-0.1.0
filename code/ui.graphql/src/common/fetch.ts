import { Json, JsonFetcher } from '../types';

const fetch = require('isomorphic-fetch');

/**
 * See:
 *  - https://github.com/graphql/graphiql#getting-started
 */
export function graphqlFetcher(args: { url: string }): JsonFetcher {
  return async (params: any): Promise<Json | undefined> => {
    const res = await fetch(args.url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json;
  };
}
