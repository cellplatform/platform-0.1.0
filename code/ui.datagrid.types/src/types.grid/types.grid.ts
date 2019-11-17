import { t, Observable } from '../common';
import { KeyBindings } from '@platform/react/lib/types';

export type IGrid = IGridProperties & IGridMethods;
export type IGridProperties = {
  readonly id: string;
  readonly data: t.IGridData;
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
  readonly refsTable: t.IRefsTable;
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
  toPosition(ref: t.GridCellRef): t.ICoordPosition;
  updateHashes(options?: { force?: boolean }): IGrid;
  fire: GridFire;
  command: GridFireCommand;
};

export type GridFire = (e: t.GridEvent) => IGrid;
export type GridFireCommand = <C extends t.IGridCommand>(args: GridFireCommandArgs<C>) => IGrid;
export type GridFireCommandArgs<C extends t.IGridCommand> = {
  command: C['command'];
  props: C['props'];
  cancel?: () => void;
};

export type IGridDefaults = {
  ns: t.INs;
  totalColumns: number;
  totalRows: number;
  columnWidth: number;
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
  changes(args?: { cells?: string | string[] }): Promise<t.IFuncTableResponse>;
  update(args?: { cells?: string | string[] }): Promise<t.IFuncTableResponse>;
};
