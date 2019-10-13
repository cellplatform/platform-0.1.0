import { t } from '../common';

export type ICellProps = Partial<ICellPropsAll>;
export type ICellPropsAll = {
  value: t.CellValue; // The calculated display value if different from the raw cell value.
  style: ICellPropsStyle;
  merge: ICellPropsMerge;
  view: ICellPropsView;
  status: ICellPropsStatus;
};

export type ICellPropsStyle = Partial<ICellPropsStyleAll>;
export type ICellPropsStyleAll = {
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
export type ICellPropsView<V extends string = string> = Partial<ICellPropsViewAll<V>>;
export type ICellPropsViewAll<V extends string = string> = {
  type: V;
  className: string;
};

/**
 * Status and error-state associated with the cell.
 */
export type ICellPropsStatus = Partial<ICellPropsStatusAll>;
export type ICellPropsStatusAll = { error?: ICellPropsError };
export type ICellPropsError<T extends string = any> = {
  type: T;
  message: string;
};
