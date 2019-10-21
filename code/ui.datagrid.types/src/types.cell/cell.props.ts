import { t } from '../common';

export type IGridCellProps = Partial<IGridCellPropsAll>;
export type IGridCellPropsAll = {
  value: t.CellValue; // The calculated display value if different from the raw cell value.
  style: IGridCellPropsStyle;
  merge: ICellPropsMerge;
  view: IGridCellPropsView;
  status: IGridCellPropsStatus;
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

/**
 * Status and error-state associated with the cell.
 */
export type IGridCellPropsStatus = Partial<IGridCellPropsStatusAll>;
export type IGridCellPropsStatusAll = { error?: IGridCellPropsError };
export type IGridCellPropsError<T extends string = any> = {
  type: T;
  message: string;
};
