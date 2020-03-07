import { diff, t } from '../common';

/**
 * Compare two cells.
 */
export function cellDiff(left: t.ICellData, right: t.ICellData): t.ICellDiff {
  const list = diff.compare(left, right) as diff.Diff<t.ICellData>[];
  const isDifferent = list.length > 0;
  return { left, right, isDifferent, list };
}
