import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { renderer } from '../../src/renderer';
import { CommandState, t } from '../common';
import { root } from './cmds';

export function init(args: {
  ipc: t.IpcClient;
  state$: Subject<Partial<t.ITestState>>;
  getState: () => t.ITestState;
}) {
  const { state$, ipc } = args;
  const { db } = renderer.init({ ipc, onCreate: e => monitor(e.dir, e.db) });

  const populate = async (dir: string, db: t.IDb) => {
    const res = await db.find({});
    const databases = { ...(args.getState().databases || {}), [dir]: res.map };
    state$.next({ databases });
  };

  const monitor = (dir: string, db: t.IDb) => {
    populate(dir, db);
    db.events$
      .pipe(
        filter(e => e.type === 'DOC/change'),
        map(e => e.payload as t.IDbActionChange),
      )
      .subscribe(e => {
        let databases = { ...(args.getState().databases || {}) };
        const db = { ...(databases[dir] || {}) };
        db[e.key] = e.value;
        databases = { ...databases, [dir]: db };
        state$.next({ databases });
      });
  };

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        ipc,
        db,
        next(state: Partial<t.ITestState>) {
          state$.next(state);
        },
        get state() {
          return args.getState();
        },
        get current() {
          return db(args.getState().current || 'fs:tmp/db-1');
        },
      };
      return { props };
    },
  });
}
