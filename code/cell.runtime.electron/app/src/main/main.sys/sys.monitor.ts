import { Subject } from 'rxjs';

import { Client, t } from '../common';
import { saveLogger } from './sys.log';

/**
 * Monitor the [sys] cells.
 */
export function monitor(args: { ctx: t.IContext; event$: Subject<t.AppEvent> }) {
  const { ctx } = args;
  const event$ = args.event$ as Subject<t.TypedSheetEvent>;
  const { client, sheet } = ctx;
  client.changes.watch(sheet);

  const saver = Client.saveMonitor({ client, debounce: 300, event$ });
  const { saved$ } = saver;

  saveLogger({ ctx, saved$ });
}
