import { t, R } from '../common';

/**
 * Determine if a row's fields has changed.
 */
export function isRowChanged(left?: t.IGridRow, right?: t.IGridRow) {
  return isAxisChanged(left, right);
}

/**
 * Determine if a column's fields has changed.
 */
export function isColumnChanged(left?: t.IGridColumn, right?: t.IGridColumn) {
  return isAxisChanged(left, right);
}

/**
 * Determine if the given row/column's fields has changed.
 */
export function isAxisChanged<T = t.IGridAxis>(left?: T, right?: T) {
  return !R.equals(left, right);
}
