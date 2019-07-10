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

  const monitor = (dir: string, db: t.IDb) => {
    db.events$
      .pipe(
        filter(e => e.type === 'DOC/put' || e.type === 'DOC/delete'),
        map(e => e.payload as t.IDbAction),
      )
      .subscribe(e => {
        // e.payload.
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
