import { Subject } from 'rxjs';
import { debounceTime, filter, map, share, takeUntil } from 'rxjs/operators';

import {
  coord,
  defaultValue,
  R,
  t,
  value as valueUtil,
  toSelectionValues,
  util,
  MemoryCache,
  IGridCell,
} from '../../common';
import { DEFAULT } from '../../common/constants';
import { Cell } from '../Cell';
import { keyboard } from '../../keyboard';
import { commands } from '../../commands';
import { calc } from './Grid.calc';

export type IGridArgs = {
  table: Handsontable;
  totalColumns: number;
  totalRows: number;
  values?: t.IGridCells;
  columns?: t.IGridColumns;
  rows?: t.IGridRows;
  defaults?: Partial<t.IGridDefaults>;
  keyBindings?: t.KeyBindings<t.GridCommand>;
  getFunc?: t.GetFunc;
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
   * Generate a complete defaults object from partial input.
   */
  public static defaults(input?: Partial<t.IGridDefaults>): t.IGridDefaults {
    const partial = input || {};
    return {
      columWidth: defaultValue(partial.columWidth, DEFAULT.COLUMN.WIDTH),
      columnWidthMin: defaultValue(partial.columnWidthMin, DEFAULT.COLUMN.WIDTH_MIN),
      rowHeight: defaultValue(partial.rowHeight, DEFAULT.ROW.HEIGHT),
      rowHeightMin: defaultValue(partial.rowHeightMin, DEFAULT.ROW.HEIGHT_MIN),
    };
  }

  /**
   * Converts the values.
   */
  public static toDataArray(args: {
    values: t.IGridCells;
    totalColumns: number;
    totalRows: number;
  }) {
    return Array.from({ length: args.totalRows }).map((v, row) =>
      Array.from({ length: args.totalColumns }).map((v, column) => {
        return args.values[Cell.toKey({ row, column })];
      }),
    );
  }

  /**
   * Determine if the given value is default.
   */
  public static isDefaultValue(args: {
    defaults?: t.IGridDefaults;
    kind: t.GridCellType;
    value?: any;
  }) {
    const { kind, value } = args;
    const defaults = Grid.defaults(args.defaults);
    return util.isDefaultGridValue({ defaults, kind, value });
  }

  /**
   * [Constructor]
   */
  private constructor(args: IGridArgs) {
    this.totalColumns = args.totalColumns;
    this.totalRows = args.totalRows;
    this._.table = args.table;
    this._.cells = args.values || {};
    this._.columns = args.columns || {};
    this._.rows = args.rows || {};
    this._.calc = calc({ grid: this, getFunc: args.getFunc });

    this.id = `grid/${(this._.table as any).guid.replace(/^ht_/, '')}`;
    this.defaults = Grid.defaults(args.defaults);

    this.events$
      .pipe(filter(e => e.type === 'GRID/ready'))
      .subscribe(() => (this._.isReady = true));

    /**
     * Keyboard bindings.
     */
    this.keyBindings = R.uniqBy(R.prop('command'), [
      ...(args.keyBindings || []),
      ...DEFAULT.KEY_BINDINGS,
    ]);

    /**
     * Initialize controllers.
     */
    const fire = this.fire;
    keyboard.init({ grid: this, fire });
    commands.init({ grid: this, fire });

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
      const value = e.value.to;
      const props = {
        ...this.cell(key).props,
        value: undefined, // NB: Reset the calculated "display value" as this will be overriden by the new value.
      };
      const cell: t.IGridCell = { value, props };
      this.changeCells({ [key]: cell }, { source: 'EDIT' });
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

    /**
     * Recalculate grid when cells change.
     */
    this.events$
      .pipe(
        filter(e => (this._.isReady = true)),
        filter(e => e.type === 'GRID/cells/change'),
        map(e => e.payload as t.IGridCellsChange),
      )
      .subscribe(async e => {
        const cells = e.changes.map(change => change.cell.key);
        await this.calc.update({ cells });
      });
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    cache: MemoryCache.create(),
    table: (undefined as unknown) as Handsontable,
    dispose$: new Subject<{}>(),
    events$: new Subject<t.GridEvent>(),
    redraw$: new Subject(),
    isReady: false,
    isEditing: false,
    cells: ({} as unknown) as t.IGrid['cells'],
    columns: ({} as unknown) as t.IGridColumns,
    rows: ({} as unknown) as t.IGridRows,
    lastSelection: (undefined as unknown) as t.IGridSelection,
    calc: (undefined as unknown) as t.IGridCalculate,
  };

  public readonly id: string;
  public readonly totalColumns: number;
  public readonly totalRows: number;
  public readonly defaults: t.IGridDefaults;
  public readonly keyBindings: t.KeyBindings<t.GridCommand>;
  public clipboard: t.IGridClipboardPending | undefined;

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

  public get cells() {
    return this._.cells;
  }
  private setValues(values: t.IGridCells) {
    values = { ...values };
    const totalColumns = this.totalColumns;
    const totalRows = this.totalRows;
    const data = Grid.toDataArray({ values, totalColumns, totalRows });
    this._.cells = values;
    this._.table.loadData(data);
  }

  public get calc(): t.IGridCalculate {
    return this._.calc;
  }

  /**
   * Merge cells.
   * https://handsontable.com/docs/6.1.1/demo-merged-cells.html
   */
  public mergeCells(args: { cells: t.IGridCells; init?: boolean }) {
    type MergeCell = { row: number; col: number; rowspan: number; colspan: number };
    type MergeCells = { [key: string]: MergeCell };

    const { cells } = args;

    // Get the list of current values (or empty if `init` requested)/
    const list: MergeCell[] = args.init
      ? []
      : (this._.table.getSettings().mergeCells as MergeCell[]) || [];

    // Convert list into an object-map.
    const map = list.reduce((acc, next) => {
      const key = coord.cell.toKey(next.col, next.row);
      acc[key] = next;
      return acc;
    }, {}) as MergeCells;

    // Update the object-map with "cell-merge" props from the given values.
    Object.keys(cells).map(key => {
      const item = cells[key];
      if (item) {
        const props: t.ICellProps = item.props || {};
        const merge = props.merge;
        if (merge) {
          const rowspan = Math.max(1, defaultValue(merge.rowspan, 1));
          const colspan = Math.max(1, defaultValue(merge.colspan, 1));
          const { row, column: col } = coord.cell.fromKey(key);
          map[key] = { row, col, rowspan, colspan };
        }
      }
    });

    // Convert the object-map back into an array.
    const mergeCells = Object.keys(map).map(key => map[key]);
    this._.table.updateSettings({ mergeCells }, false);

    // Finish up.
    return this;
  }

  public get columns() {
    return this._.columns;
  }
  public set columns(value: t.IGridColumns) {
    this._.columns = {}; // Reset.
    this.changeColumns(value, { source: 'RESET' });
  }

  public get rows() {
    return this._.rows;
  }
  public set rows(value: t.IGridRows) {
    this._.rows = {}; // Reset.
    this.changeRows(value, { source: 'RESET' });
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

    // Format and de-dupe ranges.
    if (ranges.length > 0) {
      // Convert full row/columns selections to proper range syntax (eg "A:A" or "1:1").
      const totalColumns = this.totalColumns;
      const totalRows = this.totalRows;
      const union = coord.range.union(ranges).formated({ totalColumns, totalRows });
      ranges = union.ranges.map(range => range.key);

      // Ensure the selected single "cell" is not included within the set of ranges.
      if (cell) {
        ranges = ranges.filter(range => range !== `${cell}:${cell}`);
      }

      // De-dupe.
      ranges = R.uniq(ranges);
    }

    // Finish up.
    let result: t.IGridSelection = { cell, ranges };
    result = all ? { ...result, all } : result;
    return result;
  }

  /**
   * Retrieves the currently selected key/value pairs.
   */
  public get selectionValues(): t.IGridCells {
    const values = this.cells;
    const selection = this.selection;
    return toSelectionValues({ cells: values, selection });
  }

  /**
   * Custom border styles for cell ranges.
   */
  // public get borders(): t.IGridBorder[] {
  //   const settings = this._.table.getSettings();
  //   const current = settings.customBorders;
  //   if (!Array.isArray(current)) {
  //     return [];
  //   }
  //   return current.map(item => {
  //     const from = coord.cell.toKey(item.range.from.col, item.range.from.row);
  //     const to = coord.cell.toKey(item.range.to.col, item.range.to.row);
  //     const range = `${from}:${to}`;

  //     const { top, right, bottom, left } = item;
  //     const all = [top, right, bottom, left];
  //     const allEqual = all.every(a => all.every(b => R.equals(a, b)));

  //     const border: t.IGridBorder = {
  //       range,
  //       style: allEqual ? top : { top, right, bottom, left },
  //     };
  //     return border;
  //   });
  // }
  // public set borders(borders: t.IGridBorder[]) {
  //   const from = this.borders;
  //   const table = this._.table;

  //   // Check for no change.
  //   if (borders.length === 0) {
  //     table.updateSettings({ customBorders: false }, false);
  //     this.fire({ type: 'GRID/borders/changed', payload: { from, to: this.borders } });
  //     return;
  //   }

  //   // Convert input into format Handsontable understands.
  //   const toRange = (input: string) => {
  //     const range = coord.range.fromKey(input);
  //     const { left, right } = range;
  //     return {
  //       from: { row: left.row, col: left.column },
  //       to: { row: right.row, col: right.column },
  //     };
  //   };
  //   const toStyles = (input: t.IGridBorder['style']) => {
  //     if (typeof (input as t.IGridBorderEdgeStyles).top === 'object') {
  //       return input as t.IGridBorderEdgeStyles;
  //     }
  //     const style = input as t.IGridBorderStyle;
  //     return { top: style, right: style, bottom: style, left: style };
  //   };

  //   const toBorders = (items: t.IGridBorder[]) => {
  //     return items.map(item => {
  //       const range = toRange(item.range);
  //       return { range, ...toStyles(item.style) };
  //     });
  //   };
  //   const update = (items: t.IGridBorder[]) => {
  //     const customBorders = toBorders(items);
  //     table.updateSettings({ customBorders }, false);
  //   };

  //   // Update table.
  //   update(borders);
  //   this.fire({ type: 'GRID/borders/changed', payload: { from, to: borders } });
  // }

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
   * Updates cell values.
   */
  public changeCells(
    cells: t.IGridCells,
    options: { source?: t.GridCellChangeType; silent?: boolean; init?: boolean } = {},
  ) {
    const done = () => this;

    const format = (key: string, to?: t.IGridCell) => {
      if (Cell.isEmpty(to)) {
        return undefined;
      }
      if (to) {
        to = { ...to, hash: util.cellHash(key, to) };
        if (Cell.isEmptyProps(to.props)) {
          delete to.props; // Strip any empty props or props with default values.
        }
      }
      return to;
    };

    // NB: If initializing, and no initial values, ensure the grid is loaded.
    if (options.init && cells && Object.keys(cells).length === 0) {
      this.setValues({});
      return done();
    }

    if (cells) {
      // Process input object.
      const current = { ...(options.init ? {} : this.cells) };
      cells = { ...cells };

      // Ensure only cells (eg "A1") not rows/columns (eg "B" or "3").
      Object.keys(cells)
        .filter(key => !coord.cell.isCell(key))
        .forEach(key => delete cells[key]);

      // Format incoming values ensuring they are clean and structurally consistent.
      type Values = { [key: string]: { from?: t.IGridCell; to?: IGridCell } };
      const formatted: Values = Object.keys(cells).reduce((acc, key) => {
        acc[key] = {
          from: format(key, current[key]),
          to: format(key, cells[key]),
        };
        return acc;
      }, {});

      // Calculate the set of change events.
      const changes = Object.keys(cells).map(key => {
        const cell = this.cell(key);
        const { from, to } = formatted[key];
        return Cell.changeEvent({ cell, from, to });
      });

      // Exit out if no values have changed.
      const isChanged = changes.some(e => e.isChanged);
      if (!isChanged) {
        return done();
      }

      // Fire change event.
      if (!options.silent) {
        const payload: t.IGridCellsChange = {
          source: defaultValue(options.source, 'EDIT'),
          changes,
          get isCancelled() {
            return changes.some(change => change.isCancelled);
          },
          cancel() {
            changes.forEach(change => change.cancel());
          },
        };
        this.fire({ type: 'GRID/cells/change', payload });

        // Adjust any modified values.
        changes
          .filter(change => change.isModified)
          .forEach(change => (cells[change.cell.key] = change.value.to));

        // Revert any cancelled events.
        changes
          .filter(change => change.isCancelled)
          .forEach(change => (cells[change.cell.key] = change.value.from));
      }

      // Calculate the new updated value set.
      const mergeChanges: t.IGridCells = {};
      const updates = {
        ...current,
        ...Object.keys(formatted).reduce((acc, key) => {
          acc[key] = formatted[key].to;
          return acc;
        }, {}),
      };
      Object.keys(formatted).forEach(key => {
        const { from, to } = formatted[key];

        // Strip empty values.
        if (Cell.isEmpty(to)) {
          delete updates[key];
          return;
        }

        // Determine if any merge values have changed.
        if (Cell.isChanged(from, to, 'merge')) {
          mergeChanges[key] = to;
        }
      });

      // Update any cell-merge changes.
      if (Object.keys(mergeChanges).length > 0) {
        this.mergeCells({ cells: mergeChanges });
      }

      // Update the UI.
      this.setValues(updates);
    }

    // Finish up.
    return done();
  }

  /**
   * Updates columns.
   */
  public changeColumns(columns: t.IGridColumns, options: { source?: t.GridColumnChangeType } = {}) {
    const { source = 'UPDATE' } = options;
    const from = { ...this._.columns };
    const to = { ...from };
    let changes: t.IGridColumnChange[] = [];

    Object.keys(columns).forEach(key => {
      const prev = from[key] || { width: -1 };
      const next = columns[key] || { width: this.defaults.columWidth };
      const isDefault = next.width === this.defaults.columWidth;
      if (isDefault) {
        delete to[key];
      } else {
        to[key] = next;
      }
      if (!R.equals(prev, next)) {
        changes = [...changes, { column: key, source, from: prev, to: next }];
      }
    });
    this._.columns = to;
    if (!R.equals(from, to)) {
      this.fire({ type: 'GRID/columns/change', payload: { from, to, changes } });
    }
    return this;
  }

  /**
   *  Updates rows.
   */
  public changeRows(rows: t.IGridRows, options: { source?: t.GridColumnChangeType } = {}) {
    const { source = 'UPDATE' } = options;
    const from = { ...this._.rows };
    const to = { ...from };
    let changes: t.IGridRowChange[] = [];

    Object.keys(rows).forEach(key => {
      const prev = from[key] || { height: -1 };
      const next = rows[key] || { height: this.defaults.rowHeight };
      const isDefault = next.height === this.defaults.rowHeight;
      if (isDefault) {
        delete to[key];
      } else {
        to[key] = next;
      }
      if (!R.equals(prev, next)) {
        const row = coord.cell.fromKey(key).row;
        changes = [...changes, { row, source, from: prev, to: next }];
      }
    });
    this._.rows = to;

    if (!R.equals(from, to)) {
      this.fire({
        type: 'GRID/rows/change',
        payload: { from, to, changes },
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
    if (row < 0 || column < 0) {
      let msg = `Cell does not exist at row:${row}, column:${column}.`;
      msg = typeof key === 'string' ? `${msg} key: "${key}"` : msg;
      throw new Error(msg);
    }
    return this._.cache.get<Cell<t.ICellProps>>(`cell/${column}:${row}`, () => {
      return Cell.create({ table: this._.table, row, column });
    });
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
    const totalColumns = this.totalColumns;
    const totalRows = this.totalRows;
    const table = this._.table;
    const scrollToCell = valueUtil.defaultValue(args.scrollToCell, true);

    // Select requested ranges.
    const ranges = (args.ranges || [])
      .map(range => Cell.toRangePositions({ range, totalColumns, totalRows }))
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
   * Updates the cell hash for each value.
   */
  public updateHashes(options: { force?: boolean } = {}) {
    const values = { ...this.cells };
    let isChanged = false;
    Object.keys(values).forEach(key => {
      const value = values[key];
      if (value) {
        let hash = value.hash;
        if (!hash || options.force) {
          hash = util.cellHash(key, value);
          values[key] = { ...value, hash };
          isChanged = true;
        }
      }
    });
    if (isChanged) {
      this.setValues(values);
    }
    return this;
  }

  /**
   * [Internal]
   */
  public fire: t.FireGridEvent = e => this._.events$.next(e);
}
