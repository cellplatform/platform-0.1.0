import { t } from '../common';

export type IGridCellProps = Partial<IGridCellPropsAll>;
export type IGridCellPropsAll = t.ICellProps & {
  style: IGridCellPropsStyle;
  merge: ICellPropsMerge;
  view: IGridCellPropsView;
};

export type IGridCellPropsStyle = Partial<IGridCellPropsStyleAll>;
export type IGridCellPropsStyleAll = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

export type ICellPropsMerge = Partial<ICellPropsMergeAll>;
export type ICellPropsMergeAll = {
  rowspan: number;
  colspan: number;
};

/**
 * The details of a view to display for the cell.
 */
export type IGridCellPropsView<V extends string = string> = Partial<ICellPropsViewAll<V>>;
export type ICellPropsViewAll<V extends string = string> = {
  type: V;
  className: string;
};
