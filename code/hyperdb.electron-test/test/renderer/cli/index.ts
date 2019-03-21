import { Subject } from 'rxjs';

import * as t from '../../types';
import { CommandState } from '../common';
import { root } from './commands';
import { CommandLineEvent } from './types';
import { map, takeUntil, filter } from 'rxjs/operators';

export * from './commands';
export * from './types';

export const events$ = new Subject<CommandLineEvent>();

/**
 * Initializes the CLI structure.
 */
export function init(args: {
  log: t.ILog;
  ipc: t.IpcClient;
  store: t.ITestStore;
  databases: t.IDbRendererFactory;
}): t.ITestCommandLine {
  const { log, databases, store } = args;
  const state = CommandState.create({ root });
  const reload$ = new Subject();

  const hot = (module as any).hot;
  if (hot) {
    hot.dispose(() => reload$.next());
  }

  let grid: t.ITestGridState = {};
  const handlers$ = events$.pipe(takeUntil(reload$));
  handlers$
    .pipe(
      filter(e => e.type === 'CLI/grid/change'),
      map(e => e as t.ITestGridChangeEvent),
    )
    .subscribe(e => {
      const state = e.payload.state;
      if (state && state.selection && state.selection.current) {
        grid = { ...grid, selection: state.selection };
      }
    });

  const invoke: t.ITestCommandLine['invoke'] = async e => {
    const { command, args } = e;
    const dir = e.db ? e.db.dir : undefined;
    const ref = dir ? databases.get({ dir }) : undefined;
    const db = ref ? ref.db : undefined;
    const network = ref ? ref.network : undefined;
    const props: t.ITestCommandProps = {
      log,
      databases,
      store,
      events$,
      db,
      network,
      get grid() {
        return grid;
      },
      error(err: string | Error) {
        const message = typeof err === 'string' ? err : err.message;
        log.error(message);
        events$.next({ type: 'CLI/error', payload: { message, command } });
      },
    };

    // Step into namespace (if required).
    state.change({ text: state.text, namespace: true });

    // Invoke handler.
    if (command.handler) {
      log.info('INVOKE', command.toString());
      await command.invoke({ props, args });
    }
  };

  return {
    events$,
    state,
    databases,
    invoke,
  };
}
