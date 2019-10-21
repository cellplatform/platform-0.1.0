/**
 * Cell
 */
export type CellValue = string | boolean | number | object | null | undefined;

export type ICellProps = {
  value?: CellValue; // The calculated display value if different from the raw cell value.
};

export type ICellData<P extends ICellProps = ICellProps> = {
  value?: CellValue;
  props?: P;
  hash?: string;
};

/**
 * Column
 */
export type IColumnProps = {};
export type IColumnData<P extends IColumnProps = IColumnProps> = { props?: P; hash?: string };

/**
 * Row
 */
export type IRowProps = {};
export type IRowData<P extends IRowProps = IRowProps> = { props?: P; hash?: string };
