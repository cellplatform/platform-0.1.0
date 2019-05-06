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

type IConstructorArgs = {
  uri: string;
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
    const { uri } = args;
    this._.uri = uri;
    this._.apollo = new ApolloClient({ uri });
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
    uri: '',
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
    return this._.uri;
  }

  /**
   * [Methods]
   */

  public async query<D = any, V = t.IGqlVariables>(
    req: t.IGqlQueryOptions<V>,
  ): Promise<t.IGqlQueryResult<D>> {
    this.throwIfDisposed('query');
    this.fire({ type: 'GRAPHQL/querying', payload: { req } });
    const res = await this._.apollo.query<D>(req);
    this.fire({ type: 'GRAPHQL/queried', payload: { req, res } });
    return res;
  }

  public async mutate<D = any, V = t.IGqlVariables>(
    req: t.IGqlMutateOptions<D, V>,
  ): Promise<t.IGqlMutateResult<D>> {
    this.throwIfDisposed('mutate');
    this.fire({ type: 'GRAPHQL/mutating', payload: { req } });
    const res = await this._.apollo.mutate<D>(req);
    this.fire({ type: 'GRAPHQL/mutated', payload: { req, res } });
    return res;
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
}
