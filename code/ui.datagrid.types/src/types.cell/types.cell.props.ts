import { t } from '../common';

export type IGridCellProps = Partial<IGridCellPropsAll>;
export type IGridCellPropsAll = t.ICellProps & {
  style: IGridCellPropsStyle;
  merge: IGridCellPropsMerge;
  view: IGridCellPropsView;
};

export type IGridCellPropsStyle = Partial<IGridCellPropsStyleAll>;
export type IGridCellPropsStyleAll = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

export type IGridCellPropsMerge = Partial<IGridCellPropsMergeAll>;
export type IGridCellPropsMergeAll = {
  rowspan: number;
  colspan: number;
};

/**
 * The details of a view to display for the cell.
 */
export type IGridCellPropsView = Partial<IGridCellPropsViewAll>;
export type IGridCellPropsViewAll = {
  cell: ICellView;
  editor: ICellView;
  screen: ICellView;
};
export type ICellView<V extends string = string> = {
  type: V;
  className?: string;
};
