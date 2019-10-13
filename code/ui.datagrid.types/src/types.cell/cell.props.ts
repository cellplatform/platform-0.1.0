import { t } from '../common';

export type ICellProps = Partial<ICellPropsAll>;
export type ICellPropsAll = {
  value: t.CellValue; // The calculated display value if different from the raw cell value.
  style: ICellPropsStyle;
  merge: ICellPropsMerge;
  view: ICellPropsView;
  error: ICellPropsErrors;
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
 * Errors associated with the cell.
 */
export type ICellPropsErrors<E extends ICellPropsError = ICellPropsError> = Partial<
  ICellPropsErrorsAll<E>
>;
export type ICellPropsErrorsAll<E extends ICellPropsError = ICellPropsError> = { list: E[] };
export type ICellPropsError = { message: string };
