import { Subject } from 'rxjs';
import { create as createGraphqlClient } from '@platform/graphql';

import { CommandState, store, t, conversation, Key } from '../common';
import { root } from './cmds';
import { createThreadCommentProps } from './cmds.ThreadComment';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;
  const keys = new Key({});

  // Sample.
  const user: t.IThreadUser = { id: 'mary@foo.com' };
  const initial: t.IThreadStoreModel = { id: keys.thread.id('1234'), items: [], draft: { user } };

  // Create test data stores.
  const stores = {
    thread: store.thread.create({ initial }),
  };
  const threadCommentProps = createThreadCommentProps();

  // Setup graphql.
  const client = createGraphqlClient({ uri: 'http://localhost:5000/graphql' });
  conversation.graphql.init({
    client,
    stores,
  });

  // CLI.
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        threadCommentProps,
        threadStore: stores.thread,
        state$,
        next: (e: t.ITestState) => state$.next(e),
      };
      return { props };
    },
  });
}
