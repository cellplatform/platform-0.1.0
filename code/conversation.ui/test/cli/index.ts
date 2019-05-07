import { Subject } from 'rxjs';
import { create as createGraphqlClient } from '@platform/graphql';

import { CommandState, store, t, id as idUtil, conversation, gql } from '../common';
import { root } from './cmds';
import { createThreadCommentProps } from './cmds.ThreadComment';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  // Sample.
  const user: t.IThreadUser = { id: 'mary@foo.com' };
  const initial: t.IThreadModel = { id: idUtil.cuid(), items: [], draft: { user } };

  // Create test data stores.
  const threadStore = store.thread.create({ initial });
  const threadCommentProps = createThreadCommentProps();

  // Setup graphql.
  const client = createGraphqlClient({ uri: 'http://localhost:5000/graphql' });
  const graphql = conversation.graphql.init({ client, stores: { thread: threadStore } });

  // CLI.
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        threadCommentProps,
        threadStore,
        state$,
        next: (e: t.ITestState) => state$.next(e),
      };
      return { props };
    },
  });
}
