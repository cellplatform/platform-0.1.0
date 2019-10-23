import { R, t, cell } from '../common';

export { cell };
export type CellChangeField = keyof t.IGridCellProps | 'VALUE' | 'PROPS';

/**
 * Produces a uniform cell properties object.
 */
export function toGridCellProps(input?: t.IGridCellProps): t.IGridCellPropsAll {
  const props = input || {};
  const value: t.CellValue = props.value;
  const style: t.IGridCellPropsStyle = props.style || {};
  const merge: t.ICellPropsMerge = props.merge || {};
  const view: t.IGridCellPropsView = props.view || {};
  return { value, style, merge, view };
}
