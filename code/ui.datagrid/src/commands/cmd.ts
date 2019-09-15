import { filter, map } from 'rxjs/operators';
import { t } from '../common';
import * as clipboard from './cmd.clipboard';

export function init(args: { grid: t.IGrid; fire: t.FireGridEvent }) {
  const { grid, fire } = args;

  const command$ = grid.events$.pipe(
    filter(e => e.type === 'GRID/command'),
    map(e => e.payload as t.IGridCommand),
  );

  // Initialize command handlers.
  clipboard.init({ grid, command$, fire });
}
