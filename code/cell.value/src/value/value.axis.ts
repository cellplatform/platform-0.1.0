import { t, R } from '../common';

type Axis = t.IColumnData | t.IRowData;

/**
 * Determine if a row's fields has changed.
 */
export function isRowChanged(left?: t.IRowData, right?: t.IRowData) {
  return isAxisChanged(left, right);
}

/**
 * Determine if a column's fields has changed.
 */
export function isColumnChanged(left?: t.IColumnData, right?: t.IColumnData) {
  return isAxisChanged(left, right);
}

/**
 * Determine if the given row/column's fields has changed.
 */
export function isAxisChanged<T extends Axis = Axis>(left?: T, right?: T) {
  const propsLeft = left ? left.props : undefined;
  const propsRight = right ? right.props : undefined;
  return !R.equals(propsLeft, propsRight);
}
