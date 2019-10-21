import { t, R, defaultValue } from '../common';

// type Axis = t.IColumnData | t.IRowData;

// /**
//  * Determine if a row's fields has changed.
//  */
// export function isRowChanged(left?: t.IRowData, right?: t.IRowData) {
//   return isAxisChanged(left, right);
// }

// /**
//  * Determine if a column's fields has changed.
//  */
// export function isColumnChanged(left?: t.IColumnData, right?: t.IColumnData) {
//   return isAxisChanged(left, right);
// }

// /**
//  * Determine if the given row/column's fields has changed.
//  */
// export function isAxisChanged<T extends Axis = Axis>(left?: T, right?: T) {
//   const propsLeft = left ? left.props : undefined;
//   const propsRight = right ? right.props : undefined;
//   return !R.equals(propsLeft, propsRight);
// }

/**
 * Produces a uniform row properties object.
 */
export function toRowProps(input?: t.IGridRowProps): t.IGridRowPropsAll {
  const props: t.IGridRowProps = input || {};
  const height = defaultValue(props.height, -1);
  return { height };
}

/**
 * Produces a uniform column properties object.
 */
export function toColumnProps(input?: t.IGridColumnProps): t.IGridColumnPropsAll {
  const props: t.IGridColumnProps = input || {};
  const width = defaultValue(props.width, -1);
  return { width };
}
