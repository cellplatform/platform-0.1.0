import { Subject } from 'rxjs';
import { filter, map, share, takeUntil, debounceTime } from 'rxjs/operators';

import { coord, t, value as valueUtil, R, time } from '../../common';
import { Cell } from '../Cell';
import { DEFAULT } from '../../common/constants';
import { keyboard } from './keyboard';

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
     * Keyboard controllers.
     */
    keyboard.clipboard({ grid: this, events$: this._.events$, dispose$: this.dispose$ });

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
    editEnd$
      .pipe(
        filter(e => !e.isCancelled),
        filter(e => e.cell.key === this.selection.cell),
      )
      .subscribe(e => {
        // Select next cell (below) when use ends and edit, typcially with ENTER key.
        const below = e.cell.siblings.bottom;
        if (below) {
          this.select({ cell: below });
        }
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
    dispose$: new Subject<{}>(),
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
  public readonly keyboard$ = this._.events$.pipe(
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
    this._.columns = {}; // Reset.
    this.changeColumns(value, { type: 'RESET' });
  }

  public get rows() {
    return this._.rows;
  }
  public set rows(value: t.IGridRows) {
    this._.rows = {}; // Reset.
    this.changeRows(value, { type: 'RESET' });
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
   * Retrieves the currently selected key/value pairs.
   */
  public get selectedValues(): t.IGridValues {
    const selection = this.selection;
    if (selection.all) {
      return this.values;
    }

    const values = this.values;
    const union = coord.range.union(this.selection.ranges);
    return union.keys.reduce((acc, key) => {
      const value = values[key];
      return value === undefined ? acc : { ...acc, [key]: value };
    }, {});
  }

  /**
   * Custom border styles for cell ranges.
   */
  public get borders(): t.IGridBorder[] {
    const settings = this._.table.getSettings();
    const current = settings.customBorders;
    if (!Array.isArray(current)) {
      return [];
    }
    return current.map(item => {
      const from = coord.cell.toKey(item.range.from.col, item.range.from.row);
      const to = coord.cell.toKey(item.range.to.col, item.range.to.row);
      const range = `${from}:${to}`;

      const { top, right, bottom, left } = item;
      const all = [top, right, bottom, left];
      const allEqual = all.every(a => all.every(b => R.equals(a, b)));

      const border: t.IGridBorder = {
        range,
        style: allEqual ? top : { top, right, bottom, left },
      };
      return border;
    });
  }
  public set borders(borders: t.IGridBorder[]) {
    const from = this.borders;
    const table = this._.table;

    // Check for no change.
    if (borders.length === 0) {
      table.updateSettings({ customBorders: false }, false);
      this.fire({ type: 'GRID/borders/changed', payload: { from, to: this.borders } });
      return;
    }

    // Convert input into format Handsontable understands.
    const toRange = (input: string) => {
      const range = coord.range.fromKey(input);
      const { left, right } = range;
      return {
        from: { row: left.row, col: left.column },
        to: { row: right.row, col: right.column },
      };
    };
    const toStyles = (input: t.IGridBorder['style']) => {
      if (typeof (input as t.IGridBorderEdgeStyles).top === 'object') {
        return input as t.IGridBorderEdgeStyles;
      }
      const style = input as t.IGridBorderStyle;
      return { top: style, right: style, bottom: style, left: style };
    };

    const toBorders = (items: t.IGridBorder[]) => {
      return items.map(item => {
        const range = toRange(item.range);
        return { range, ...toStyles(item.style) };
      });
    };
    const update = (items: t.IGridBorder[]) => {
      const customBorders = toBorders(items);
      table.updateSettings({ customBorders }, false);
    };

    // Update table.
    update(borders);
    this.fire({ type: 'GRID/borders/changed', payload: { from, to: borders } });
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
   * Updates columns.
   */
  public changeColumns(columns: t.IGridColumns, options: { type?: t.IColumnChange['type'] } = {}) {
    const { type = 'UPDATE' } = options;
    const from = { ...this._.columns };
    const to = { ...from };
    let changes: t.IColumnChange[] = [];

    Object.keys(columns).forEach(key => {
      const prev = from[key] || { width: -1 };
      const next = columns[key] || { width: DEFAULT.COLUMN_WIDTH };
      const isDefault = next.width === DEFAULT.COLUMN_WIDTH;
      if (isDefault) {
        delete to[key];
      } else {
        to[key] = next;
      }
      if (!R.equals(prev, next)) {
        changes = [...changes, { column: key, type, from: prev, to: next }];
      }
    });
    this._.columns = to;
    if (!R.equals(from, to)) {
      this.fire({ type: 'GRID/columns/changed', payload: { from, to, changes } });
    }
    return this;
  }

  /**
   *  Updates rows.
   */
  public changeRows(rows: t.IGridRows, options: { type?: t.IColumnChange['type'] } = {}) {
    const { type = 'UPDATE' } = options;
    const from = { ...this._.rows };
    const to = { ...from };
    let changes: t.IRowChange[] = [];
    Object.keys(rows).forEach(key => {
      const prev = from[key] || { height: -1 };
      const next = rows[key] || { height: DEFAULT.ROW_HEIGHT };
      const isDefault = next.height === DEFAULT.ROW_HEIGHT;
      if (isDefault) {
        delete to[key];
      } else {
        to[key] = next;
      }
      if (!R.equals(prev, next)) {
        const row = parseInt(key, 10);
        changes = [...changes, { row, type, from: prev, to: next }];
      }
    });
    this._.rows = to;
    if (!R.equals(from, to)) {
      this.fire({ type: 'GRID/rows/changed', payload: { from, to, changes } });
    }
    return this;
  }

  /**
   * Retrieves an API for working with a single cell.
   */
  public cell(key: { row: number; column: number } | string) {
    const args = typeof key === 'string' ? Cell.fromKey(key) : key;
    const { row, column } = args;
    if (row < 0 || column < 0) {
      let msg = `Cell does not exist at row:${row}, column:${column}.`;
      msg = typeof key === 'string' ? `${msg} key: "${key}"` : msg;
      throw new Error(msg);
    }
    return Cell.create({ table: this._.table, row, column });
  }

  /**
   * Scroll the grids view-port to the given column/row coordinates.
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
    const cell = (last && last.cell) || 'A1';
    const ranges = last.ranges || [];
    this.select({ cell, ranges });
    return this;
  }

  public blur() {
    this.fire({ type: 'GRID/blur', payload: { grid: this } });
    this.deselect();
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
