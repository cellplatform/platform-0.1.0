import { t, diff } from '../common';

/**
 * Compare two cells.
 */
export function cellDiff(left: t.IGridCell, right: t.IGridCell): t.ICellDiff {
  const list = diff.compare(left, right) as Array<diff.Diff<t.IGridCell>>;
  const isDifferent = list.length > 0;
  return { left, right, isDifferent, list };
}
