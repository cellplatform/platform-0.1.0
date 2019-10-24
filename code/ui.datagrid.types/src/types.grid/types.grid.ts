import { t, Observable } from '../common';
import { KeyBindings } from '@platform/react/lib/types';

export type IGridData = t.ITableData<t.IGridCellData, IGridColumnData, IGridRowData>;

export type IGrid = IGridProperties & IGridMethods;
export type IGridProperties = {
  readonly id: string;
  readonly data: IGridData;
  readonly totalColumns: number;
  readonly totalRows: number;
  readonly isDisposed: boolean;
  readonly isReady: boolean;
  readonly isEditing: boolean;
  readonly selection: t.IGridSelection;
  readonly selectionValues: t.IGridData['cells'];
  readonly events$: Observable<t.GridEvent>;
  readonly keyboard$: Observable<t.IGridKeydown>;
  readonly keyBindings: KeyBindings<t.GridCommand>;
  readonly defaults: IGridDefaults;
  readonly calc: IGridCalculate;
  clipboard?: IGridClipboardPending;
};
export type IGridMethods = {
  dispose(): void;
  changeCells(
    cells: t.IGridData['cells'],
    options?: { source?: t.GridCellChangeType; silent?: boolean; init?: boolean },
  ): IGrid;
  changeColumns(
    columns: t.IGridData['columns'],
    options?: { source?: t.IGridColumnChange['source'] },
  ): IGrid;
  changeRows(rows: t.IGridData['rows'], options?: { source?: t.GridRowChangeType }): IGrid;
  cell(key: t.GridCellRef): t.IGridCell;
  scrollTo(args: { cell: t.GridCellRef; snapToBottom?: boolean; snapToRight?: boolean }): IGrid;
  select(args: {
    cell: t.GridCellRef;
    ranges?: t.GridCellRangeKey[];
    scrollToCell?: boolean;
  }): IGrid;
  deselect(): IGrid;
  focus(): IGrid;
  redraw(): IGrid;
  mergeCells(args: { cells: t.IGridData['cells']; init?: boolean }): IGrid;
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
  from: IGridData['cells'];
  to: IGridData['cells'];
  func: t.IFuncUpdateResponse;
  cells: string[];
};

export type IGridColumnPropsAll = t.IColumnProps & { width: number };
export type IGridColumnProps = Partial<IGridColumnPropsAll>;
export type IGridColumnData = t.IColumnData<IGridColumnProps>;

export type IGridRowPropsAll = t.IRowProps & { height: number };
export type IGridRowProps = Partial<IGridRowPropsAll>;
export type IGridRowData = t.IRowData<IGridRowProps>;

export type IGridCellData<P extends t.ICellProps = t.IGridCellProps> = t.ICellData<P>;

export type GetGridCell<P = t.IGridCellProps> = (
  key: string,
) => Promise<IGridCellData<P> | undefined>;
