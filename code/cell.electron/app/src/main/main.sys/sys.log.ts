import { debounceTime } from 'rxjs/operators';
import { coord, log, Observable, t, Uri } from '../common';

/**
 * Logs save operations
 */
export function saveLogger(args: { ctx: t.IContext; saved$: Observable<t.ITypedSheetSaved> }) {
  const { ctx, saved$ } = args;
  const pool = ctx.sheet.pool;

  const findType = (ns: string, key: string) => {
    const sheet = pool.sheet(ns);
    const column = coord.cell.toColumnKey(key);
    if (sheet) {
      for (const item of sheet.types) {
        for (const type of item.columns) {
          if (type.column === column) {
            return type;
          }
        }
      }
    }
    return undefined;
  };

  // Models saved.
  saved$.subscribe(e => {
    const prefix = e.ok ? log.blue('SAVED') : log.red('SAVED (error)');
    log.info(prefix);

    if (e.changes.ns) {
      const ns = e.sheet.uri.id;
      log.info.gray(`    ${log.green('ns')}:${ns}`);
    }

    const cells = e.changes.cells || {};

    Object.keys(cells).forEach(key => {
      const change = cells[key];
      const ns = change.ns;
      const type = findType(ns, change.key);
      const prop = type ? type.prop : '';
      const cell = Uri.create.cell(ns, change.key);
      log.info(`  ${log.format.uri(cell)} ${prop}`);
    });
  });

  // Divider
  saved$.pipe(debounceTime(800)).subscribe(() => log.info.gray('━'.repeat(60)));
}
