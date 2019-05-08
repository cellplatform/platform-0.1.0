/**
 * NOTES:
 * - Migrating from `apollo-boost`
 *   Necessary when turning on "batching"
 *   https://www.apollographql.com/docs/react/advanced/boost-migration
 *
 * - About batching
 *   https://blog.apollographql.com/batching-client-graphql-queries-a685f5bcd41b
 */

import ApolloClient from 'apollo-boost';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { ErrorResponse } from 'apollo-link-error';

type IConstructorArgs = {
  uri: string;
  name?: string;
  version?: string;
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
    this._.apollo = new ApolloClient({
      uri: this.uri,
      name: this.name,
      version: this.version,
      onError: err => this.onError(err),
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
    dispose$: new Subject(),
    events$: new Subject<t.GraphqlEvent>(),
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
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
    this.fire({ type: 'GRAPHQL/querying', payload: { request } });
    const response = await this._.apollo.query<D>(request);
    this.fire({ type: 'GRAPHQL/queried', payload: { request, response } });
    return response;
  }

  public async mutate<D = any, V = t.IGqlVariables>(
    request: t.IGqlMutateOptions<D, V>,
  ): Promise<t.IGqlMutateResult<D>> {
    this.throwIfDisposed('mutate');
    this.fire({ type: 'GRAPHQL/mutating', payload: { request } });
    const response = await this._.apollo.mutate<D>(request);
    this.fire({ type: 'GRAPHQL/mutated', payload: { request, response } });
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

  private fire(e: t.GraphqlEvent) {
    this._.events$.next(e);
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} graphql because client is disposed.`);
    }
  }

  private onError(err: ErrorResponse) {
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
  }
}
