import { Subject } from 'rxjs';

import { CommandState, props, t } from '../common';
import { root } from './cmds';
import { createThreadCommentProps } from './cmds.ThreadComment';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  // Observable state.
  const threadComment = createThreadCommentProps();

  // CLI.
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        threadComment,
        state$,
        next(state: t.ITestState) {
          state$.next(state);
        },
      };
      return { props };
    },
  });
}
