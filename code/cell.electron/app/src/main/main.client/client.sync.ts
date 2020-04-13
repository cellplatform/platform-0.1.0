import { debounceTime } from 'rxjs/operators';
import { coord, defaultValue, t, log } from '../common';

/**
 * Monitors for changes in a sheet and saves results back to the server.
 */
export function saveMonitor(args: {
  http: t.IHttpClient;
  state: t.ITypedSheetState<any>;
  debounce?: number;
  silent?: boolean;
}) {
  const { http, state } = args;
  const uri = state.uri.toString();
  const ns = http.ns(uri);

  /**
   * TODO 🐷
   * - move this to [TypeSystem] as write syncer.
   */

  const toChangedCells = (changes: t.ITypedSheetStateChanges) => {
    const cells: t.ICellMap = {};
    Object.keys(changes)
      .filter(key => coord.cell.isCell(key))
      .forEach(key => (cells[key] = changes[key].to));
    return cells;
  };

  const saveChanges = async () => {
    const cells = toChangedCells(state.changes);
    const res = await ns.write({ cells });
    if (!args.silent) {
      log.info(log.blue(`[${res.status}:SAVED]`), uri, '| changed:', Object.keys(cells));
      if (!res.ok) {
        log.error('cells', cells);
        log.error('res', res);
      }
    }
  };

  const debounce = debounceTime(defaultValue(args.debounce, 300));
  state.changed$.pipe(debounce).subscribe(e => saveChanges());
}
