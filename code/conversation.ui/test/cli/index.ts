import { Subject } from 'rxjs';

import { CommandState, store, t } from '../common';
import { root } from './cmds';
import { createThreadCommentProps } from './cmds.ThreadComment';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;
  const user: t.IThreadUser = { id: 'sub|mary', name: 'mary@foo.com' };
  const threadStore = store.thread.create({ user });
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
