import { t, R } from '../common';

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
export function isAxisChanged<T = t.IGridAxisData>(left?: T, right?: T) {
  return !R.equals(left, right);
}
