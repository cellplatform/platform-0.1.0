import { Subject } from 'rxjs';

import { CommandState, Sync, t } from '../common';
import { root } from './cmds';

export function init(args: {
  getSync: () => Sync;
  state$: Subject<Partial<t.ITestState>>;
  getDb: () => t.IDb;
  getState: () => t.ITestState;
}) {
  const { state$, getDb: getDatabase, getSync } = args;

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        state$,
        get db() {
          return getDatabase();
        },
        get sync() {
          return getSync();
        },
      };
      return { props };
    },
  });
}
