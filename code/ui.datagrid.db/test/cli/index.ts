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
    db.watch('column/');
    db.watch('row/');
    db.watch$.subscribe(e => {
      const pattern = e.pattern;
      const key = e.key;
      const value = e.value.to;
      const db = { ...(getState().db || { cells: {}, columns: {}, rows: {} }) };

      if (pattern === 'cell/') {
        db.cells = { ...db.cells, [key]: value };
      }
      if (pattern === 'column/') {
        db.columns = { ...db.columns, [key]: value };
      }
      if (pattern === 'row/') {
        db.rows = { ...db.rows, [key]: value };
      }

      state$.next({ db });
    });

    /**
     * Load initial values.
     */
    const loadValues = async (pattern: string, target: object) => {
      const values = await (await getDb()).values({ pattern });
      Object.keys(values).forEach(key => (target[key] = values[key].value));
    };

    const target = { cells: {}, columns: {}, rows: {} };
    await loadValues('cell/', target.cells);
    await loadValues('column/', target.columns);
    await loadValues('row/', target.rows);
    state$.next({ db: target });

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
