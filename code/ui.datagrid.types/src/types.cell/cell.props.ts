import { t } from '../common';

export type ICellProps = {
  readonly value?: t.CellValue; // The calculated display value if different from the raw cell value.
  readonly style?: ICellPropsStyle;
  readonly merge?: ICellPropsMerge;
  readonly view?: ICellPropsView;
};

export type ICellPropsStyle = {
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly underline?: boolean;
};

export type ICellPropsMerge = {
  readonly rowspan?: number;
  readonly colspan?: number;
};

/**
 * The details of a view to display for the cell.
 */
export type ICellPropsView<V extends string = any> = {
  type: V;
};
