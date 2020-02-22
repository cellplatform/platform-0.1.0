import { t } from '../common';
import { Diff } from '@platform/util.diff/lib/types';

/**
 * Cell
 */
export type ICellProps = {
  name?: string; // Display name of the cell.
  value?: t.CellValue; // The calculated display value if different from the raw cell value.
  type?: t.ICellType;
};

export type ICellData<P extends ICellProps = ICellProps> = {
  value?: t.CellValue;
  props?: P;
  hash?: string;
  error?: t.IError;
  links?: t.IUriMap;
};

export type ICellDiff<P extends ICellProps = ICellProps> = {
  readonly left: ICellData<P>;
  readonly right: ICellData<P>;
  readonly isDifferent: boolean;
  readonly list: Array<Diff<ICellData<P>>>;
};

/**
 * Row
 */
export type IRowProps = {
  name?: string; // Display name of the row.
};
export type IRowData<P extends IRowProps = IRowProps> = {
  props?: P;
  hash?: string;
  error?: t.IError;
};

/**
 * Column
 */
export type IColumnProps = {
  name?: string; // Display name of the column.
  type?: t.ICellType;
};
export type IColumnData<P extends IColumnProps = IColumnProps> = {
  props?: P;
  hash?: string;
  error?: t.IError;
};
