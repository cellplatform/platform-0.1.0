/**
 *
 * NOTES:
 * - About batching
 *   https://blog.apollographql.com/batching-client-graphql-queries-a685f5bcd41b
 *
 */

import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ErrorLink, onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { Subject } from 'rxjs';
import { share, takeUntil, map, filter } from 'rxjs/operators';

import { t, fetcher } from '../common';

type IConstructorArgs = {
  uri: string;
  name?: string;
  version?: string;
  fetchPolicy?: t.IGqlFetchPolicy;
};

/**
 * A client for accessing a graphql server.
 */
export class GraphqlClient implements t.IGqlClient {
  /**
   * [Static]
   */
  public static create(args: IConstructorArgs) {
    return new GraphqlClient(args);
  }

  /**
   * [Lifecycle]
   */

  private constructor(args: IConstructorArgs) {
    this._.args = args;
    const fetch: any = fetcher({ headers: this.onHeader });

    /**
     * Setup Apollo network links.
     * - https://www.apollographql.com/docs/link
     */
    const errorLink = onError(this.onError);
    const httpLink = createHttpLink({ uri: this.uri, fetch });

    /**
     * Create Apollo client.
     */
    this._.apollo = new ApolloClient({
      name: this.name,
      version: this.version,
      cache: new InMemoryCache(),
      link: ApolloLink.from([errorLink, httpLink]),
    });
  }

  /**
   * Destroys the client.
   */
  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    args: (undefined as unknown) as IConstructorArgs,
    apollo: (undefined as unknown) as ApolloClient<{}>,
    dispose$: new Subject<{}>(),
    events$: new Subject<t.GqlEvent>(),
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(takeUntil(this.dispose$), share());
  public readonly headers$ = this.events$.pipe(
    filter(e => e.type === 'GRAPHQL/http/headers'),
    map(e => e.payload as t.IGqlHttpHeaders),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  public get uri() {
    return this._.args.uri;
  }

  public get name() {
    return this._.args.name;
  }

  public get version() {
    return this._.args.version;
  }

  /**
   * [Methods]
   */

  public async query<D = any, V = t.IGqlVariables>(
    request: t.IGqlQueryOptions<V>,
  ): Promise<t.IGqlQueryResult<D>> {
    this.throwIfDisposed('query');

    request = { ...request };
    request.fetchPolicy =
      request.fetchPolicy === undefined ? this._.args.fetchPolicy : request.fetchPolicy;

    const before: t.IGqlQueryingEvent<any> = {
      type: 'GRAPHQL/querying',
      payload: { request },
    };
    this.fire(before);

    const response = await this._.apollo.query<D>(request);

    const after: t.IGqlQueryiedEvent<any> = {
      type: 'GRAPHQL/queried',
      payload: { request, response },
    };
    this.fire(after);

    return response;
  }

  public async mutate<D = any, V = t.IGqlVariables>(
    request: t.IGqlMutateOptions<D, V>,
  ): Promise<t.IGqlMutateResult<D>> {
    this.throwIfDisposed('mutate');

    const before: t.IGqlMutatingEvent<any, any> = {
      type: 'GRAPHQL/mutating',
      payload: { request },
    };
    this.fire(before);

    const response = await this._.apollo.mutate<D>(request as any);

    const after: t.IGqlMutatedEvent<any, any> = {
      type: 'GRAPHQL/mutated',
      payload: { request, response },
    };
    this.fire(after);

    return response;
  }

  public toString() {
    let res = 'GraphqlClient';
    res = this.name ? `${res}:${this.name}` : res;
    res = this.version ? `${res}@${this.version}` : res;
    return `[${res}]`;
  }

  /**
   * [Helpers]
   */

  private fire(e: t.GqlEvent) {
    this._.events$.next(e);
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} graphql because client is disposed.`);
    }
  }

  private onError: ErrorLink.ErrorHandler = err => {
    const { graphQLErrors: errors = [], networkError: network, response, operation } = err;
    const total = errors.length + (network ? 1 : 0);
    this.fire({
      type: 'GRAPHQL/error',
      payload: {
        total,
        errors,
        network,
        response,
        operation,
      },
    });
  };

  private onHeader = async (headers: t.IHttpHeaders = {}): Promise<t.IHttpHeaders> => {
    const from = { ...headers };
    let to = { ...from };

    const payload: t.IGqlHttpHeaders = {
      get headers() {
        return { from, to: { ...to } };
      },
      merge(input) {
        to = { ...to, ...input };
        return payload;
      },
      add(header, value) {
        if (value) {
          to = { ...to, [header]: value.toString() };
        }
        return payload;
      },
      auth(token) {
        return payload.add('authorization', token);
      },
    };

    // Alert listeners allowing them to modify the headers.
    this.fire({ type: 'GRAPHQL/http/headers', payload });

    // Finish up.
    return payload.headers.to;
  };
}
