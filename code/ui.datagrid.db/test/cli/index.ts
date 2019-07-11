import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import { CommandState, constants, t } from '../common';
import { root } from './cmds';

const dir = constants.DB.DIR;

export function init(args: {
  state$: Subject<Partial<t.ITestState>>;
  databases: t.DbFactory;
  getState: () => t.ITestState;
  // ipc: t.IpcClient;
}) {
  const { state$, databases, getState } = args;

  let db: t.IDb | undefined;
  const getDb = async () => {
    if (db) {
      return db;
    }
    db = await databases(dir);

    /**
     * Watch for changes to raw DB and update debug state.
     */

    // const db$ = db.events$.pipe(takeUntil(this.dispose$));
    const dbChange$ = db.events$.pipe(
      filter(e => e.type === 'DOC/change'),
      map(e => e.payload as t.IDbActionChange),
    );

    // db.watch('cell/');
    // db.watch('column/');
    // db.watch('row/');
    dbChange$.subscribe(e => {
      // const pattern = e.pattern;
      const key = e.key;
      const value = e.value;
      const db = { ...(getState().db || { cells: {}, columns: {}, rows: {} }) };

      if (key.startsWith('cell/')) {
        // db.cells = { ...db.cells, [key]: value };
      }
      if (key.startsWith('column/')) {
        // db.columns = { ...db.columns, [key]: value };
      }
      if (key.startsWith('row/')) {
        // db.rows = { ...db.rows, [key]: value };
      }

      state$.next({ db });
    });

    /**
     * Load initial values.
     */
    const loadValues = async (pattern: string, target: object) => {
      // const values = await (await getDb()).find({ pattern });
      // Object.keys(values).forEach(key => (target[key] = values[key].value));
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
