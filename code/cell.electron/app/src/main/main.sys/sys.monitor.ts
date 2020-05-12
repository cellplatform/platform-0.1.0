import { Client, t } from '../common';
import { saveLogger } from './sys.log';

/**
 * Monitor the [sys] cells.
 */
export function monitor(args: { ctx: t.IContext }) {
  const { ctx } = args;
  const { client, sheet } = ctx;
  client.changes.watch(sheet);

  const saver = Client.saveMonitor({ client, debounce: 300 });
  const { saved$ } = saver;
  saveLogger({ ctx, saved$ });
}
