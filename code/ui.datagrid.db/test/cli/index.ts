import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { CommandState, constants, t, Sync } from '../common';
import { root } from './cmds';

export function init(args: {
  getSync: () => Sync;
  state$: Subject<Partial<t.ITestState>>;
  databases: t.DbFactory;
  getState: () => t.ITestState;
}) {
  const { state$, databases, getSync } = args;

  let db: t.IDb | undefined;
  const getDb = async () => {
    db = db || (await databases(constants.DB.FILE));
    return db;
  };

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const db = await getDb();
      const props: t.ICommandProps = {
        ...e.props,
        db,
        state$,
        databases,
        get sync() {
          return getSync();
        },
      };
      return { props };
    },
  });
}
