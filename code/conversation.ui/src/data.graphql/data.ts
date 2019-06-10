import { Subject } from 'rxjs';
import { t } from '../common';
import { ConversationThreadGraphql } from './data.thread';
import { takeUntil, share } from 'rxjs/operators';

export * from './types';

type IInitArgs = {
  client: t.IGqlClient;
  stores: { thread: t.IThreadStore };
  events$?: Subject<t.ThreadDataEvent>;
};

/**
 * Creates the graphql client
 */
export function init(args: IInitArgs) {
  return new ConversationGraphql(args);
}

/**
 * Graphql client manager.
 */
export class ConversationGraphql {
  /**
   * [Lifecycle]
   */
  public constructor(args: IInitArgs) {
    const { client, stores } = args;
    const dispose$ = this.dispose$;
    const events$ = args.events$ || new Subject<t.ThreadDataEvent>();
    this.thread = new ConversationThreadGraphql({
      client,
      store: stores.thread,
      events$,
      dispose$,
    });
  }

  /**
   * [Fields]
   */
  public readonly thread: ConversationThreadGraphql;
  private readonly dispose$ = new Subject<{}>();

  private readonly _events$ = new Subject<t.ThreadDataEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this.dispose$.isStopped;
  }

  /**
   * [Methods]
   */
  public dispose() {
    this.dispose$.next();
    this.dispose$.complete();
  }
}
