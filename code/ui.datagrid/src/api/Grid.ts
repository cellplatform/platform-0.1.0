import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t, value as valueUtil, R } from '../common';
import { Cell } from './Cell';

export type IGridArgs = {
  table: Handsontable;
  totalColumns: number;
  totalRows: number;
  values?: t.IGridValues;
};

/**
 * Strongly typed properties and methods for
 * programatically manipulating the grid.
 */
export class Grid {
  /**
   * [Static]
   */
  public static create(args: IGridArgs) {
    return new Grid(args);
  }

  /**
   * Converts the values.
   */
  public static toDataArray(args: {
    values: t.IGridValues;
    totalColumns: number;
    totalRows: number;
  }) {
    const { totalColumns, totalRows, values } = args;
    return Array.from({ length: totalRows }).map((v, row) =>
      Array.from({ length: totalColumns }).map((v, column) => {
        const key = Cell.toKey({ row, column });
        return values[key];
      }),
    );
  }

  /**
   * [Constructor]
   */
  private constructor(args: IGridArgs) {
    this.totalColumns = args.totalColumns;
    this.totalRows = args.totalRows;
    this._.table = args.table;
    this._.values = args.values || {};
    this.id = `grid/${(this._.table as any).guid.replace(/^ht_/, '')}`;

    this.events$
      .pipe(filter(e => e.type === 'GRID/ready'))
      .subscribe(() => (this._.isReady = true));

    const editEnd$ = this.events$.pipe(
      filter(e => e.type === 'GRID/EDITOR/end'),
      map(e => e.payload as t.IEndEditingEvent['payload']),
    );

    this.events$
      .pipe(filter(e => e.type === 'GRID/EDITOR/begin'))
      .subscribe(() => (this._.isEditing = true));

    editEnd$.subscribe(() => (this._.isEditing = false));
    editEnd$.pipe(filter(e => e.isChanged)).subscribe(e => {
      const key = e.cell.key;
      this.changeValues({ [key]: e.value.to }, { redraw: false });
    });
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    table: (undefined as unknown) as Handsontable,
    dispose$: new Subject(),
    events$: new Subject<t.GridEvent>(),
    isReady: false,
    isEditing: false,
    values: ({} as unknown) as t.IGridValues,
  };

  public readonly id: string;
  public readonly totalColumns: number;
  public readonly totalRows: number;
  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );
  public readonly keys$ = this._.events$.pipe(
    filter(e => e.type === 'GRID/keydown'),
    map(e => e.payload as t.IGridKeypress),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.table.isDestroyed || this._.dispose$.isStopped;
  }

  public get isReady() {
    return this.isDisposed ? false : this._.isReady;
  }

  public get isEditing() {
    return this._.isEditing;
  }

  public get values() {
    return this._.values;
  }

  public get selection(): t.IGridSelection {
    const toKey = (coord: Handsontable.wot.CellCoords) =>
      Cell.toKey({ row: coord.row, column: coord.col });

    // Current (input cell).
    const last = this._.table.getSelectedRangeLast();
    const current = last ? toKey(last.highlight) : undefined;

    // Ranges.
    const selectedRanges = this._.table.getSelectedRange() || [];
    let ranges = selectedRanges.map(item => `${toKey(item.from)}:${toKey(item.to)}`);
    ranges = ranges.length === 1 && ranges[0] === `${current}:${current}` ? [] : ranges;

    // Determine if the entire sheet is selected.
    let all = false;
    if (ranges.length > 0) {
      const min = { row: -1, col: -1 };
      const max = { row: -1, col: -1 };

      selectedRanges.forEach(range => {
        const { from, to } = range;
        min.row = min.row === -1 || from.row < min.row ? from.row : min.row;
        min.col = min.col === -1 || from.col < min.col ? from.col : min.col;

        max.row = max.row === -1 || to.row > max.row ? to.row : max.row;
        max.col = max.col === -1 || to.col > max.col ? to.col : max.col;
      });

      if (
        min.row === 0 &&
        min.col === 0 &&
        max.row === this.totalRows - 1 &&
        max.col === this.totalColumns - 1
      ) {
        all = true;
      }
    }

    // Finish up.
    let result: t.IGridSelection = { current, ranges };
    result = all ? { ...result, all } : result;
    return result;
  }

  /**
   * [Methods]
   */

  /**
   * Disposes of the grid.
   */
  public dispose() {
    const { table, dispose$ } = this._;
    if (!table.isDestroyed) {
      table.destroy();
    }
    dispose$.next();
    dispose$.complete();
  }

  /**
   * Fires an event (used internally)
   */
  public next(e: t.GridEvent) {
    this._.events$.next(e);
  }

  /**
   * Loads values into the grid.
   */
  public loadValues(values?: t.IGridValues) {
    if (values) {
      this._.values = { ...values };
    }
    const data = this.toDataArray();
    const table = this._.table;
    table.loadData(data);
  }

  /**
   * Updates values.
   */
  public changeValues(changes: t.IGridValues, options: { redraw?: boolean } = {}) {
    const redraw = valueUtil.defaultValue(options.redraw, true);
    this._.values = { ...this.values };
    Object.keys(changes).forEach(key => {
      const value = changes[key];
      this._.values[key] = value;
      if (redraw) {
        this.cell(key).value = value;
      }
    });
  }

  /**
   * Retrieves an API for working with a single cell.
   */
  public cell(key: { row: number; column: number } | string): Cell {
    const args = typeof key === 'string' ? Cell.fromKey(key) : key;
    const { row, column } = args;
    return Cell.create({ table: this._.table, row, column });
  }

  /**
   * Scroll the grids view-port to the given column/row cooridnates.
   */
  public scrollTo(args: {
    cell: t.CellRef;
    snapToBottom?: boolean; // (false) If true, viewport is scrolled to show the cell on the bottom of the table.
    snapToRight?: boolean; //  (false) If true, viewport is scrolled to show the cell on the right side of the table.
  }) {
    const { row, column } = this.toPosition(args.cell);
    const { snapToBottom = false, snapToRight = false } = args;
    this._.table.scrollViewportTo(row, column, snapToBottom, snapToRight);
  }

  /**
   * Selects the specific cell(s).
   */
  public select(args: { cell: t.CellRef; ranges?: t.GridCellRangeKey[]; scrollToCell?: boolean }) {
    const table = this._.table;
    const scrollToCell = valueUtil.defaultValue(args.scrollToCell, true);

    // Select requested ranges.
    const ranges = (args.ranges || [])
      .map(rangeKey => Cell.toRangePositions(rangeKey))
      .map(({ start, end }) => {
        return [start.row, start.column, end.row, end.column];
      });

    // Select the focus cell.
    const pos = this.toPosition(args.cell);
    const current = [pos.row, pos.column, pos.row, pos.column];
    const selection = [...ranges, current] as any;
    table.selectCells(selection, scrollToCell);
  }

  /**
   * Clears any selection.
   */
  public deselect() {
    this._.table.deselectCell();
  }

  /**
   * Retrieve the row/column position, clamped to the size of the grid.
   */
  public toPosition(ref: t.CellRef) {
    const pos = Cell.toPosition(ref);
    const row = R.clamp(0, this.totalRows - 1, pos.row);
    const column = R.clamp(0, this.totalColumns - 1, pos.column);
    return { row, column };
  }

  /**
   * Converts the current values to a data-array of `[rows:[columns[]]]`
   */
  public toDataArray() {
    return Grid.toDataArray({
      values: this.values,
      totalColumns: this.totalColumns,
      totalRows: this.totalRows,
    });
  }
}
