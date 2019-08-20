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
  const reload$ = new Subject();

  const state = CommandState.create({
    root,
    beforeInvoke: async e => {
      const { state } = e;
      const { command } = state;
      const dir = await store.get('selectedDatabase');
      const ref = dir ? databases.get({ dir }) : undefined;
      const db = ref ? ref.db : undefined;
      const network = ref ? ref.network : undefined;
      const props: t.ITestCommandProps = {
        ...e.props,
        log,
        databases,
        store,
        events$,
        db,
        network,
        error(err: string | Error) {
          const message = typeof err === 'string' ? err : err.message;
          log.error(message);
          events$.next({ type: 'CLI/error', payload: { message, command } });
        },
      };

      return { props };
    },
  });

  const hot = (module as any).hot;
  if (hot) {
    hot.dispose(() => reload$.next());
  }

  return {
    events$,
    state,
    databases,
  };
}
