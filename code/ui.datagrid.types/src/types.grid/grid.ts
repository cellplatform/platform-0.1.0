import { t, Observable } from '../common';
import { KeyBindings } from '@platform/react/lib/types';

export type IGrid = IGridProperties & IGridMethods;
export type IGridProperties = {
  id: string;
  totalColumns: number;
  totalRows: number;
  isDisposed: boolean;
  isReady: boolean;
  isEditing: boolean;
  selection: t.IGridSelection;
  selectionValues: t.IGridCells;
  events$: Observable<t.GridEvent>;
  keyboard$: Observable<t.IGridKeydown>;
  keyBindings: KeyBindings<t.GridCommand>;
  defaults: IGridDefaults;
  calc: IGridCalculate;
  cells: t.IGridCells<t.IGridCellProps>;
  columns: IGridColumns;
  rows: IGridRows;
  clipboard?: IGridClipboardPending;
};
export type IGridMethods = {
  dispose(): void;
  changeCells(
    cells: t.IGridCells,
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
  mergeCells(args: { cells: t.IGridCells; init?: boolean }): IGrid;
  toPosition(ref: t.CellRef): t.ICoord;
  updateHashes(options?: { force?: boolean }): IGrid;
};

export type IGridDefaults = {
  totalColumns: number;
  totalRows: number;
  columWidth: number;
  columnWidthMin: number;
  rowHeight: number;
  rowHeightMin: number;
};

export type IGridSelection = {
  cell?: t.GridCellKey;
  ranges: t.GridCellRangeKey[];
  all?: boolean;
};

export type IGridClipboardPending = t.IGridClipboard<t.GridClipboardReadCommand> & {
  pasted: number;
};

export type IGridCalculate = {
  changes(args?: { cells?: string | string[] }): Promise<IGridCalculateResponse>;
  update(args?: { cells?: string | string[] }): Promise<IGridCalculateResponse>;
};
export type IGridCalculateResponse = {
  from: IGridCells;
  to: IGridCells;
  func: t.IFuncUpdateResponse;
  cells: string[];
};

export type IGridColumns = { [key: string]: IGridColumnData };
export type IGridRows = { [key: string]: IGridRowData };
export type IGridCells<P = {}> = { [key: string]: IGridCellData<P> | undefined };

export type IGridAxisData = IGridColumnData | IGridRowData;
export type IGridColumnData = { width?: number };
export type IGridRowData = { height?: number };

export type IGridCellData<P = t.IGridCellProps> = { value?: t.CellValue; props?: P; hash?: string };

export type GetGridCell<P = t.IGridCellProps> = (
  key: string,
) => Promise<IGridCellData<P> | undefined>;
