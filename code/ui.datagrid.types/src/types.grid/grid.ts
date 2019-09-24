import { t, Observable } from '../common';
import { KeyBindings } from '@platform/react/lib/types';

export type IGrid = IGridProperties & IGridMethods;
export type IGridProperties = {
  readonly id: string;
  readonly totalColumns: number;
  readonly totalRows: number;
  readonly isDisposed: boolean;
  readonly isReady: boolean;
  readonly isEditing: boolean;
  readonly selection: t.IGridSelection;
  readonly selectionValues: t.IGridCells;
  readonly events$: Observable<t.GridEvent>;
  readonly keyboard$: Observable<t.IGridKeydown>;
  readonly keyBindings: KeyBindings<t.GridCommand>;
  readonly defaults: IGridDefaults;
  readonly values: t.IGridCells;
  columns: IGridColumns;
  rows: IGridRows;
  clipboard?: IGridClipboardPending;
};
export type IGridMethods = {
  dispose(): void;
  changeCells(
    changes: t.IGridCells,
    options?: { source?: t.GridCellChangeType; silent?: boolean; init?: boolean },
  ): IGrid;
  changeColumns(
    columns: t.IGridColumns,
    options?: { source?: t.IGridColumnChange['source'] },
  ): IGrid;
  changeRows(rows: t.IGridRows, options?: { source?: t.GridRowChangeType }): IGrid;
  cell(key: t.CellRef): t.ICell;
  scrollTo(args: { cell: t.CellRef; snapToBottom?: boolean; snapToRight?: boolean }): IGrid;
  select(args: { cell: t.CellRef; ranges?: t.GridCellRangeKey[]; scrollToCell?: boolean }): IGrid;
  deselect(): IGrid;
  focus(): IGrid;
  redraw(): IGrid;
  mergeCells(args: { values: t.IGridCells; init?: boolean }): IGrid;
  toPosition(ref: t.CellRef): t.ICoord;
  updateHashes(options?: { force?: boolean }): IGrid;
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

export type IGridClipboardPending = t.IGridClipboard<t.GridClipboardReadCommand> & {
  pasted: number;
};

export type IGridColumns = { [key: string]: IGridColumn };
export type IGridRows = { [key: string]: IGridRow };
export type IGridCells<P = {}> = { [key: string]: IGridCell<P> | undefined };

export type IGridAxis = IGridColumn | IGridRow;
export type IGridColumn = { width?: number };
export type IGridRow = { height?: number };
export type IGridCell<P = t.ICellProps> = { value?: t.CellValue; props?: P; hash?: string };
