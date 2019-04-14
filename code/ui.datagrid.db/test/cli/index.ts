import { Subject } from 'rxjs';

import { CommandState, constants, t } from '../common';
import { root } from './cmds';

const dir = constants.DB.DIR;

export function init(args: {
  state$: Subject<Partial<t.ITestState>>;
  databases: t.IDbFactory;
  getState: () => t.ITestState;
}) {
  const { state$, databases, getState } = args;

  let db: t.IDb | undefined;
  const getDb = async () => {
    if (db) {
      return db;
    }
    db = (await databases.getOrCreate({ dir, connect: false })).db;

    /**
     * Watch for changes to raw DB and update debug state.
     */
    db.watch('cell/');
    db.watch$.subscribe(e => {
      const key = e.key;
      const value = e.value.to;
      const values = { ...(getState()['db.cells'] || {}), [key]: value };
      state$.next({ ['db.cells']: values });
    });

    /**
     * Load initial values.
     */
    const cells = await db.values({ pattern: 'cell/' });
    Object.keys(cells).forEach(key => (cells[key] = cells[key].value));
    state$.next({ ['db.cells']: cells });

    return db;
  };

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const db = await getDb();
      const props: t.ICommandProps = { ...e.props, db, state$, databases };
      return { props };
    },
  });
}
