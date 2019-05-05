import { Subject } from 'rxjs';

import { CommandState, store, t } from '../common';
import { root } from './cmds';
import { createThreadCommentProps } from './cmds.ThreadComment';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;
  const threadStore = store.thread.create();
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
