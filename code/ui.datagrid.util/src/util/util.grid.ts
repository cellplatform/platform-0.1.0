import { R, t } from '../common';
import { isEmptyCell } from './util.cell';

/**
 * Determine if the given value is default.
 */
export function isDefaultGridValue(args: {
  defaults: t.IGridDefaults;
  kind: t.GridCellType;
  value?: any;
}) {
  const { kind, value, defaults } = args;

  switch (kind) {
    case 'COLUMN':
      return !value || R.equals(value, { width: defaults.columWidth });
    case 'ROW':
      return !value || R.equals(value, { height: defaults.rowHeight });
    case 'CELL':
      return isEmptyCell(value);
    default:
      throw new Error(`Kind '${kind}' not supported.`);
  }
}
