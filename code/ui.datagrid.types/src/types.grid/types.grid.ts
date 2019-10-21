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
  selectionValues: t.IGridCellsData;
  events$: Observable<t.GridEvent>;
  keyboard$: Observable<t.IGridKeydown>;
  keyBindings: KeyBindings<t.GridCommand>;
  defaults: IGridDefaults;
  calc: IGridCalculate;
  cells: t.IGridCellsData<t.IGridCellProps>;
  columns: IGridColumnsData;
  rows: IGridRowsData;
  clipboard?: IGridClipboardPending;
};
export type IGridMethods = {
  dispose(): void;
  changeCells(
    cells: t.IGridCellsData,
    options?: { source?: t.GridCellChangeType; silent?: boolean; init?: boolean },
  ): IGrid;
  changeColumns(
    columns: t.IGridColumnsData,
    options?: { source?: t.IGridColumnChange['source'] },
  ): IGrid;
  changeRows(rows: t.IGridRowsData, options?: { source?: t.GridRowChangeType }): IGrid;
  cell(key: t.GridCellRef): t.ICell;
  scrollTo(args: { cell: t.GridCellRef; snapToBottom?: boolean; snapToRight?: boolean }): IGrid;
  select(args: {
    cell: t.GridCellRef;
    ranges?: t.GridCellRangeKey[];
    scrollToCell?: boolean;
  }): IGrid;
  deselect(): IGrid;
  focus(): IGrid;
  redraw(): IGrid;
  mergeCells(args: { cells: t.IGridCellsData; init?: boolean }): IGrid;
  toPosition(ref: t.GridCellRef): t.ICoord;
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
  from: IGridCellsData;
  to: IGridCellsData;
  func: t.IFuncUpdateResponse;
  cells: string[];
};

export type IGridColumnsData = { [key: string]: IGridColumnData };
export type IGridRowsData = { [key: string]: IGridRowData };
export type IGridCellsData<P = {}> = { [key: string]: IGridCellData<P> | undefined };

export type IGridColumnData = { width?: number };
export type IGridRowData = { height?: number };
export type IGridCellData<P extends t.ICellProps = t.IGridCellProps> = t.ICellData<P>;

export type GetGridCell<P = t.IGridCellProps> = (
  key: string,
) => Promise<IGridCellData<P> | undefined>;
