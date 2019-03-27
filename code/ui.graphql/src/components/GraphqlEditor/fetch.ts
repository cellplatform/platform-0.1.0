import { Subject } from 'rxjs';
import { t, id } from '../../common';

const fetch = require('isomorphic-fetch');

/**
 * See:
 *  - https://github.com/graphql/graphiql#getting-started
 */
export function graphqlFetcher(args: {
  url: string;
  events$: Subject<t.GraphqlEditorEvent>;
}): t.JsonFetcher {
  return async (params: any): Promise<t.Json> => {
    const { url, events$ } = args;
    const fetchId = id.shortid();

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

    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
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
