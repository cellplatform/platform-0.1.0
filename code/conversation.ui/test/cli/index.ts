import { Subject } from 'rxjs';
import { create as createGraphqlClient } from '@platform/graphql';

import { CommandState, store, t, log, conversation, MsgKeys, PEOPLE } from '../common';
import { root } from './cmds';
import { createThreadCommentProps } from './cmds.ThreadComment';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;
  const keys = new MsgKeys({});

  // Sample.
  const user: t.IUserIdentity = PEOPLE.MARY;
  const initial: t.IThreadStoreModel = {
    id: keys.thread.threadId('1234'),
    items: [],
    users: [],
    ui: {
      draft: { user },
    },
  };

  // Create test data stores.
  const stores = {
    thread: store.thread.create({ initial, getGraphql: () => graphql }),
  };
  const threadCommentProps = createThreadCommentProps();

  stores.thread.events$.subscribe(e => {
    log.info('🐷', e.type, e.payload);
  });

  const data$ = new Subject<t.ThreadDataEvent>();
  data$.subscribe(e => {
    log.info('🌳', e.type, e.payload);
  });

  // Setup graphql.
  const client = createGraphqlClient({ uri: 'http://localhost:5000/graphql' });
  const graphql = conversation.data.init({ client, stores, events$: data$ });

  // CLI.
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        user,
        graphql,
        threadCommentProps,
        threadStore: stores.thread,
        state$,
        next: (e: t.ITestState) => state$.next(e),
      };
      return { props };
    },
  });
}
