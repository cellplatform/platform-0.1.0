import { Subject } from 'rxjs';
import { t } from '../common';
import { ConversationThreadGraphql } from './graphql.thread';

export * from './types';

type IInitArgs = {
  client: t.IGqlClient;
  stores: { thread: t.IThreadStore };
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
    this.thread = new ConversationThreadGraphql({ client, store: stores.thread, dispose$ });
  }

  /**
   * [Fields]
   */
  public readonly thread: ConversationThreadGraphql;
  private dispose$ = new Subject();

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
