import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t, value as valueUtil } from '../common';
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
    isEditing: false,
    values: ({} as unknown) as t.IGridValues,
  };

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

  public get instanceId() {
    return (this._.table as any).guid;
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
    const last = this._.table.getSelectedRangeLast();
    const current = last ? toKey(last.highlight) : undefined;
    const selectedRanges = this._.table.getSelectedRange() || [];
    let ranges = selectedRanges.map(item => `${toKey(item.from)}:${toKey(item.to)}`);
    ranges = ranges.length === 1 && ranges[0] === `${current}:${current}` ? [] : ranges;
    return { current, ranges };
  }

  /**
   * [Methods]
   */

  /**
   * Disposes of the grid.
   */
  public dispose() {
    const { table, dispose$ } = this._;
    if (table.isDestroyed) {
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
    const { row, column } = Cell.toPosition(args.cell);
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
    const current = Cell.toPosition(args.cell);
    const selection = [...ranges, [current.row, current.column, current.row, current.column]];
    table.selectCells(selection as any, scrollToCell);
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
