import { t, Observable } from '../common';

export type IGrid = IGridProperties & IGridMethods;
export type IGridProperties = {
  readonly id: string;
  readonly totalColumns: number;
  readonly totalRows: number;
  readonly isDisposed: boolean;
  readonly isReady: boolean;
  readonly isEditing: boolean;
  readonly selection: t.IGridSelection;
  readonly selectedValues: t.IGridValues;
  readonly events$: Observable<t.GridEvent>;
  readonly keyboard$: Observable<t.IGridKeydown>;
  readonly defaults: IGridDefaults;
  values: t.IGridValues;
  columns: IGridColumns;
  rows: IGridRows;
};
export type IGridMethods = {
  dispose(): void;
  changeCells(
    changes: t.IGridValues,
    options?: { source?: t.GridCellChangeType; silent?: boolean },
  ): IGrid;
  changeColumns(
    columns: t.IGridColumns,
    options?: { source?: t.IGridColumnChange['source'] },
  ): IGrid;
  changeRows(rows: t.IGridRows, options?: { source?: t.IGridRowChange['source'] }): IGrid;
  cell(key: t.CellRef): t.ICell;
  scrollTo(args: { cell: t.CellRef; snapToBottom?: boolean; snapToRight?: boolean }): IGrid;
  select(args: { cell: t.CellRef; ranges?: t.GridCellRangeKey[]; scrollToCell?: boolean }): IGrid;
  deselect(): IGrid;
  focus(): IGrid;
  redraw(): IGrid;
  toPosition(ref: t.CellRef): t.ICoord;
};

export type IGridDefaults = {
  columWidth: number;
  columnWidthMin: number;
  rowHeight: number;
  rowHeightMin: number;
};

export type IGridSelection = {
  readonly cell?: t.GridCellKey;
  readonly ranges: t.GridCellRangeKey[];
  readonly all?: boolean;
};

export type IGridColumns = { [key: string]: IGridColumn };
export type IGridRows = { [key: string]: IGridRow };
export type IGridValues = { [key: string]: IGridCell | undefined };

export type IGridColumn = { width?: number };
export type IGridRow = { height?: number };
export type IGridCell = { value: t.CellValue };
