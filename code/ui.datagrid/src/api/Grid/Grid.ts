import { Subject } from 'rxjs';
import { filter, map, share, takeUntil, debounceTime } from 'rxjs/operators';

import { t, value as valueUtil, R } from '../../common';
import { Cell } from '../Cell';

export type IGridArgs = {
  table: Handsontable;
  totalColumns: number;
  totalRows: number;
  values?: t.IGridValues;
  columns?: t.IGridColumns;
  rows?: t.IGridRows;
};

/**
 * Strongly typed properties and methods for
 * programatically manipulating the grid.
 */
export class Grid implements t.IGrid {
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
    this._.columns = args.columns || {};
    this._.rows = args.rows || {};
    this.id = `grid/${(this._.table as any).guid.replace(/^ht_/, '')}`;

    this.events$
      .pipe(filter(e => e.type === 'GRID/ready'))
      .subscribe(() => (this._.isReady = true));

    /**
     * Debounced redraw.
     */
    this._.redraw$
      .pipe(
        takeUntil(this.dispose$),
        debounceTime(0),
      )
      .subscribe(e => this.fire({ type: 'GRID/redraw', payload: {} }));

    /**
     * Manage editor events.
     */
    this.events$
      .pipe(filter(e => e.type === 'GRID/EDITOR/begin'))
      .subscribe(() => (this._.isEditing = true));

    const editEnd$ = this.events$.pipe(
      filter(e => e.type === 'GRID/EDITOR/end'),
      map(e => e.payload as t.IEndEditingEvent['payload']),
    );

    editEnd$.subscribe(() => (this._.isEditing = false));
    editEnd$.pipe(filter(e => e.isChanged)).subscribe(e => {
      const key = e.cell.key;
      this.changeValues({ [key]: e.value.to }, { redraw: false });
    });

    const selection$ = this.events$.pipe(
      filter(e => e.type === 'GRID/selection'),
      map(e => e.payload as t.IGridSelectionChange),
    );

    selection$
      // Retain last selection state to ressurect the value upon re-focus of grid.
      .pipe(filter(e => Boolean(e.to.cell)))
      .subscribe(e => (this._.lastSelection = e.to));

    selection$
      // Monitor focus.
      .pipe(
        debounceTime(0),
        filter(e => !Boolean(e.from.cell) && Boolean(e.to.cell)),
      )
      .subscribe(e => this.fire({ type: 'GRID/focus', payload: { grid: this } }));

    selection$
      // Monitor blur.
      .pipe(
        debounceTime(0),
        filter(e => Boolean(e.from.cell) && !Boolean(e.to.cell)),
      )
      .subscribe(e => this.fire({ type: 'GRID/blur', payload: { grid: this } }));
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    table: (undefined as unknown) as Handsontable,
    dispose$: new Subject(),
    events$: new Subject<t.GridEvent>(),
    redraw$: new Subject(),
    isReady: false,
    isEditing: false,
    values: ({} as unknown) as t.IGridValues,
    columns: ({} as unknown) as t.IGridColumns,
    rows: ({} as unknown) as t.IGridRows,
    lastSelection: (undefined as unknown) as t.IGridSelection,
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
    map(e => e.payload as t.IGridKeydown),
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
  public set values(values: t.IGridValues) {
    values = { ...values };
    const data = Grid.toDataArray({
      values,
      totalColumns: this.totalColumns,
      totalRows: this.totalRows,
    });
    this._.values = values;
    this._.table.loadData(data);
  }

  public get columns() {
    return this._.columns;
  }
  public set columns(value: t.IGridColumns) {
    const from = { ...this._.columns };
    this._.columns = value || {};
    this.fire({ type: 'GRID/columns/changed', payload: { from, to: value } });
  }

  public get rows() {
    return this._.rows;
  }
  public set rows(value: t.IGridRows) {
    const from = { ...this._.rows };
    this._.rows = value || {};
    this.fire({ type: 'GRID/rows/changed', payload: { from, to: value } });
  }

  public get selection(): t.IGridSelection {
    const toKey = (coord: Handsontable.wot.CellCoords) =>
      Cell.toKey({ row: coord.row, column: coord.col });

    // Current (input cell).
    const last = this._.table.getSelectedRangeLast();
    const cell = last ? toKey(last.highlight) : undefined;

    // Ranges.
    const selectedRanges = this._.table.getSelectedRange() || [];
    let ranges = selectedRanges.map(item => `${toKey(item.from)}:${toKey(item.to)}`);
    ranges = ranges.length === 1 && ranges[0] === `${cell}:${cell}` ? [] : ranges;

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
    let result: t.IGridSelection = { cell, ranges };
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
   * Updates values.
   */
  public changeValues(changes: t.IGridValues, options: { redraw?: boolean } = {}) {
    if (changes) {
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
    return this;
  }

  /**
   * Retrieves an API for working with a single cell.
   */
  public cell(key: { row: number; column: number } | string) {
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
    return this;
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

    return this;
  }

  /**
   * Clears any selection.
   */
  public deselect() {
    this._.table.deselectCell();
    return this;
  }

  /**
   * Assigns focus to the grid
   */
  public focus() {
    const last = this._.lastSelection;
    const cell = last.cell || 'A1';
    const ranges = last.ranges || [];
    this.select({ cell, ranges });
    return this;
  }

  /**
   * Requests that the grid be redrawn.
   */
  public redraw() {
    this._.redraw$.next();
    return this;
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
   * [Internal]
   */
  public fire(e: t.GridEvent) {
    this._.events$.next(e);
  }
}
