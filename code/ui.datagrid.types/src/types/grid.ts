import { t, Observable } from '../common';
import { CellValue } from './common';

export type IGrid = {
  /**
   * [Properties]
   */
  readonly id: string;
  readonly totalColumns: number;
  readonly totalRows: number;
  readonly isDisposed: boolean;
  readonly isReady: boolean;
  readonly isEditing: boolean;
  readonly selection: t.IGridSelection;
  readonly events$: Observable<t.GridEvent>;
  readonly keys$: Observable<t.IGridKeydown>;

  values: t.IGridValues;

  /**
   * [Methods]
   */
  dispose(): void;
  changeValues(changes: t.IGridValues, options?: { redraw?: boolean }): IGrid;
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

export type IGridValues = {
  [key: string]: CellValue;
};
