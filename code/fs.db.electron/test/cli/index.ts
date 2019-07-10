import { Subject } from 'rxjs';
import { renderer } from '../../src/renderer';

import { CommandState, t } from '../common';
import { root } from './cmds';

export function init(args: {
  ipc: t.IpcClient;
  state$: Subject<Partial<t.ITestState>>;
  getState: () => t.ITestState;
}) {
  const { state$, ipc } = args;
  const { db } = renderer.init({ ipc });

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        db,
        next(state: Partial<t.ITestState>) {
          state$.next(state);
        },
        get state() {
          return args.getState();
        },
        get current() {
          return db(args.getState().current || './tmp/db-1');
        },
      };
      return { props };
    },
  });
}
