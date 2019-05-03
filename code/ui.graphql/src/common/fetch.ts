import { Subject } from 'rxjs';
import { id } from './libs';
import * as t from '../types';

const fetch = require('isomorphic-fetch');

/**
 * See:
 *  - https://github.com/graphql/graphiql#getting-started
 */
export function graphqlFetcher(args: {
  url: string;
  events$: Subject<t.GraphqlEditorEvent>;
}): t.JsonFetcher {
  return async (params: any): Promise<t.IJsonMap> => {
    const fetchId = id.shortid();
    const { events$, url } = args;

    // Fire BEFORE event.
    let isCancelled = false;
    events$.next({
      type: 'GRAPHQL_EDITOR/fetching',
      payload: {
        fetchId,
        url,
        params,
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
        },
      },
    });
    if (isCancelled) {
      return {};
    }

    // Perform network fetch.
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(params),
      });
      const result = await res.json();

      // Fire AFTER event.
      const isError = Boolean(result.errors);
      events$.next({
        type: 'GRAPHQL_EDITOR/fetched',
        payload: { fetchId, url, params, result, isError },
      });

      // Finish up.
      return result;
    } catch (error) {
      events$.next({
        type: 'GRAPHQL_EDITOR/fetch/error',
        payload: { fetchId, url, params, error },
      });
      return {
        error: { url, message: error.message },
      };
    }
  };
}
