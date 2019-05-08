import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil, tap, takeWhile } from 'rxjs/operators';
import { gql, R, t, graphql } from '../common';

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
    events$: Subject<t.ThreadDataEvent>;
  }) {
    const { client, store, dispose$, events$ } = args;
    const store$ = store.events$.pipe(takeUntil(dispose$));

    this.store = store;
    this.client = client;
    this.dispose$ = dispose$;
    this.events$ = events$;

    store$
      // Save the thread when a new comment is added.
      .pipe(filter(e => e.type === 'THREAD/added'))
      .subscribe(e => this.saveThread());
  }

  /**
   * [Fields]
   */
  public readonly client: t.IGqlClient;
  public readonly store: t.IThreadStore;
  public readonly dispose$: Observable<{}>;
  private readonly events$: Subject<t.ThreadDataEvent>;

  /**
   * [Methods]
   */
  public async saveThread(input?: t.IThreadModel | t.IThreadStoreModel) {
    const mutation = gql`
      mutation SaveThread($thread: JSON) {
        conversation {
          threads {
            save(thread: $thread)
          }
        }
      }
    `;

    // Remove any UI specific parts of the model.
    const thread = input ? { ...input } : this.store.state;
    delete (thread as t.IThreadStoreModel).draft;

    // Fire PRE event.
    let isCancelled = false;
    this.fire({
      type: 'THREAD/saving',
      payload: {
        thread,
        get isCancelled() {
          return isCancelled;
        },
        cancel: () => (isCancelled = true),
      },
    });
    if (isCancelled) {
      return { response: undefined, isCancelled };
    }

    // Send to server.
    type IVariables = { thread: t.IThreadModel };
    const variables: IVariables = { thread };
    const response = await this.client.mutate<boolean, IVariables>({ mutation, variables });

    // Finish up.
    this.fire({ type: 'THREAD/saved', payload: { thread } });
    return { response, isCancelled: false };
  }

  /**
   * Looks up a thread by the given ID.
   */
  public async findById(id: string) {
    const query = gql`
      query Thread($id: ID!) {
        conversation {
          thread(id: $id) {
            id
            items
            users {
              id
              name
              email
            }
          }
        }
      }
    `;

    type TData = { conversation: { thread: t.IThreadModel } };

    const variables = { id };
    const res = await this.client.query<TData>({
      query,
      variables,
      fetchPolicy: 'network-only',
    });

    const thread = res.data.conversation ? res.data.conversation.thread : undefined;
    return graphql.clean(thread);
  }

  /**
   * [Helpers]
   */
  private fire(e: t.ThreadDataEvent) {
    this.events$.next(e);
  }
}
