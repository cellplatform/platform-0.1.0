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

    console.log(`\nTODO 🐷   Batch Query Setup \n`);
    console.log(`\nTODO 🐷   Mutate\n`);
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
