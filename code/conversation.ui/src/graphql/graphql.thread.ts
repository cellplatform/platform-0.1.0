import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t, gql } from '../common';

/**
 * Manage conversation-thread interactions.
 */
export class ConversationThreadGraphql {
  /**
   * [Lifecycle]
   */
  public constructor(args: {
    client: t.IGqlClient;
    store: t.IThreadStore;
    dispose$: Observable<{}>;
  }) {
    const { client, store, dispose$ } = args;

    this.store = store;
    this.client = client;
    this.dispose$ = dispose$;

    const changed$ = store.changed$.pipe(takeUntil(dispose$));

    changed$.subscribe(e => {
      console.log('🐷', e);
      this.TMP(e.to);
    });
  }

  /**
   * [Fields]
   */
  public readonly client: t.IGqlClient;
  public readonly store: t.IThreadStore;
  public readonly dispose$: Observable<{}>;

  /**
   * [Methods]
   */
  public async TMP(e: any = {}) {
    const mutation = gql`
      mutation ChangeThread($msg: JSON) {
        thread(foo: $msg)
      }
    `;

    const client = this.client;
    // type IVariables = { msg: string };
    // const variables: IVariables = { msg: 'hello' };
    // const res = await this.client.mutate<boolean, IVariables>({ mutation, variables });

    type IVariables = { msg: object };
    const variables: IVariables = { msg: e };
    const res = await client.mutate<boolean, IVariables>({ mutation, variables });

    console.log('variables', variables);

    console.log('res', res);
  }
}
