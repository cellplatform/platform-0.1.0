import { t, Observable } from '../common';

export type IGrid = IGridProperties & IGridMethods & {};
export type IGridProperties = {
  readonly id: string;
  readonly totalColumns: number;
  readonly totalRows: number;
  readonly isDisposed: boolean;
  readonly isReady: boolean;
  readonly isEditing: boolean;

  readonly selection: t.IGridSelection;
  readonly selectedValues: t.IGridValues;

  readonly values: t.IGridValues;
  readonly columns: IGridColumns;
  readonly rows: IGridRows;

  readonly events$: Observable<t.GridEvent>;
  readonly keys$: Observable<t.IGridKeydown>;
};
export type IGridMethods = {
  dispose(): void;
  changeValues(changes: t.IGridValues, options?: { redraw?: boolean }): IGrid;
  changeColumns(columns: t.IGridColumns, options?: { type?: t.IColumnChange['type'] }): IGrid;
  changeRows(rows: t.IGridRows, options?: { type?: t.IRowChange['type'] }): IGrid;
  cell(key: t.CellRef): t.ICell;
  scrollTo(args: { cell: t.CellRef; snapToBottom?: boolean; snapToRight?: boolean }): IGrid;
  select(args: { cell: t.CellRef; ranges?: t.GridCellRangeKey[]; scrollToCell?: boolean }): IGrid;
  deselect(): IGrid;
  focus(): IGrid;
  redraw(): IGrid;
  toPosition(ref: t.CellRef): t.IGridCellPosition;
};

export type IGridSelection = {
  readonly cell?: t.GridCellKey;
  readonly ranges: t.GridCellRangeKey[];
  readonly all?: boolean;
};

export type IGridValues = { [key: string]: t.CellValue };
export type IGridColumns = { [key: string]: IGridColumn };
export type IGridRows = { [key: string]: IGridRow };

export type IGridColumn = { width?: number };
export type IGridRow = { height?: number };
