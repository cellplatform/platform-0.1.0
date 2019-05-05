import { Subject } from 'rxjs';

import { CommandState, props, t, state } from '../common';
import { root } from './cmds';
import { createThreadCommentProps } from './cmds.ThreadComment';

export function init(args: {
  state$: Subject<Partial<t.ITestState>>;
  threadStore?: t.IThreadStore;
}) {
  const { state$ } = args;
  const threadStore = args.threadStore || state.thread.create();
  const threadComment = createThreadCommentProps();

  // CLI.
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        threadComment,
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
