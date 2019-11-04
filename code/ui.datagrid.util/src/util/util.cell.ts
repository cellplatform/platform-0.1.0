import { t, cell } from '../common';

export { cell };
export type CellChangeField = keyof t.IGridCellProps | 'VALUE' | 'PROPS';

/**
 * Produces a uniform cell properties object.
 */
export function toGridCellProps(input?: t.IGridCellData | t.IGridCellProps): t.IGridCellPropsAll {
  const props: t.IGridCellProps =
    typeof input !== 'object' || input === null
      ? {}
      : typeof (input as any).props === 'object'
      ? (input as any).props
      : input;
  const value: t.CellValue = props.value;
  const style: t.IGridCellPropsStyle = props.style || {};
  const merge: t.IGridCellPropsMerge = props.merge || {};
  const view: t.IGridCellPropsView = props.view || {};
  return { value, style, merge, view };
}
