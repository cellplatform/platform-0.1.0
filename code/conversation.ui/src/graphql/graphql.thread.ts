import { Observable } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { gql, R, t } from '../common';

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
    const changed$ = store.changed$.pipe(takeUntil(dispose$));

    this.store = store;
    this.client = client;
    this.dispose$ = dispose$;

    let prev = store.state;
    changed$
      .pipe(
        debounceTime(300),
        filter(() => !R.equals(prev.items, store.state.items)),
      )
      .subscribe(e => {
        console.log('🐷', e);
        this.TMP(this.store.state);
        prev = store.state;
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
      mutation SaveThread($thread: JSON) {
        conversation {
          threads {
            save(thread: $thread)
          }
        }
      }
    `;

    const client = this.client;
    // type IVariables = { msg: string };
    // const variables: IVariables = { msg: 'hello' };
    // const res = await this.client.mutate<boolean, IVariables>({ mutation, variables });

    e = { ...e };
    delete e.draft;

    type IVariables = { thread: any };
    const variables: IVariables = { thread: e };
    const res = await client.mutate<boolean, IVariables>({ mutation, variables });

    console.log('variables', variables);
    console.log('res', res);
  }
}
