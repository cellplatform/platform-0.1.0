import { t, R } from '../common';

type AxisData = t.IGridColumnData | t.IGridRowData;

/**
 * Determine if a row's fields has changed.
 */
export function isRowChanged(left?: t.IGridRowData, right?: t.IGridRowData) {
  return isAxisChanged(left, right);
}

/**
 * Determine if a column's fields has changed.
 */
export function isColumnChanged(left?: t.IGridColumnData, right?: t.IGridColumnData) {
  return isAxisChanged(left, right);
}

/**
 * Determine if the given row/column's fields has changed.
 */
export function isAxisChanged<T extends AxisData = AxisData>(left?: T, right?: T) {
  const propsLeft = left ? left.props : undefined;
  const propsRight = right ? right.props : undefined;
  return !R.equals(propsLeft, propsRight);
}
