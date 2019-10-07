import { t } from '../common';

export type ICellProps = Partial<ICellPropsAll>;
export type ICellPropsAll = {
  readonly value?: t.CellValue; // The calculated display value if different from the raw cell value.
  readonly style: ICellPropsStyle;
  readonly merge: ICellPropsMerge;
  readonly view: ICellPropsView;
};

export type ICellPropsStyle = Partial<ICellPropsStyleAll>;
export type ICellPropsStyleAll = {
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly underline?: boolean;
};

export type ICellPropsMerge = Partial<ICellPropsMergeAll>;
export type ICellPropsMergeAll = {
  readonly rowspan?: number;
  readonly colspan?: number;
};

/**
 * The details of a view to display for the cell.
 */
export type ICellPropsView<V extends string = string> = Partial<ICellPropsViewAll<V>>;
export type ICellPropsViewAll<V extends string = string> = {
  type?: V;
};
