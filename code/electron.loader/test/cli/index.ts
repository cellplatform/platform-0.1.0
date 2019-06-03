import { Subject } from 'rxjs';

import { CommandState, t } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>>; ipc: t.LoaderIpc }) {
  const { state$, ipc } = args;

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = { ...e.props, state$, ipc };
      return { props };
    },
  });
}
