import { Subject } from 'rxjs';

import { CommandState, store, t, id as idUtil } from '../common';
import { root } from './cmds';
import { createThreadCommentProps } from './cmds.ThreadComment';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  // Sample
  const user: t.IThreadUser = { id: 'mary@foo.com' };
  const initial: t.IThreadModel = { id: idUtil.cuid(), items: [], draft: { user } };

  // Create test data stores.
  const threadStore = store.thread.create({ initial });
  const threadCommentProps = createThreadCommentProps();

  // CLI.
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        threadCommentProps,
        threadStore,
        state$,
        next(state: t.ITestState) {
          state$.next(state);
        },
      };
      return { props };
    },
  });
}
