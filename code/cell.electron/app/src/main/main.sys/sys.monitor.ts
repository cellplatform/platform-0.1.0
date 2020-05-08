import { debounceTime } from 'rxjs/operators';
import { Client, log, Observable, t } from '../common';

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

/**
 * [Helpers]
 */

function saveLogger(args: { ctx: t.IContext; saved$: Observable<t.ITypedSheetSaved> }) {
  const { saved$ } = args;

  // Models saved.
  saved$.subscribe(e => {
    const prefix = e.ok ? log.blue('SAVED') : log.red('SAVED (error)');
    log.info(prefix);

    if (e.changes.ns) {
      const ns = e.sheet.uri.id;
      log.info.gray(`  ${log.green('ns')}:${ns}`);
    }

    const cells = e.changes.cells || {};
    Object.keys(cells).forEach(key => {
      const change = cells[key];
      const ns = change.ns.replace(/^ns\:/, '');
      const cell = log.gray(`${log.green('cell')}:${ns}:${log.green(change.key)}`);
      log.info(`  ${cell}`);
    });
  });

  // Divider
  saved$.pipe(debounceTime(800)).subscribe(() => log.info.gray('━'.repeat(60)));
}
