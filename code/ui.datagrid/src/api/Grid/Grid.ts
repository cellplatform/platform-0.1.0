import { Subject } from 'rxjs';
import { debounceTime, filter, map, share, takeUntil } from 'rxjs/operators';

import { commands } from '../../commands';
import {
  coord,
  defaultValue,
  MemoryCache,
  R,
  t,
  toSelectionValues,
  util,
  value as valueUtil,
} from '../../common';
import { DEFAULT } from '../../common/constants';
import { keyboard } from '../../keyboard';
import { Cell } from '../Cell';
import { calc } from './Grid.calc';

export type IGridArgs = {
  table?: Handsontable;
  totalColumns?: number;
  totalRows?: number;
  ns: t.INs | string;
  cells?: t.IGridData['cells'];
  columns?: t.IGridData['columns'];
  rows?: t.IGridData['rows'];
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
      ns: defaultValue(partial.ns, DEFAULT.NS),
      totalColumns: defaultValue(partial.totalColumns, DEFAULT.TOTAL_COLUMNS),
      totalRows: defaultValue(partial.totalRows, DEFAULT.TOTAL_ROWS),
      columnWidth: defaultValue(partial.columnWidth, DEFAULT.COLUMN.WIDTH),
      columnWidthMin: defaultValue(partial.columnWidthMin, DEFAULT.COLUMN.WIDTH_MIN),
      rowHeight: defaultValue(partial.rowHeight, DEFAULT.ROW.HEIGHT),
      rowHeightMin: defaultValue(partial.rowHeightMin, DEFAULT.ROW.HEIGHT_MIN),
    };
  }

  /**
   * Converts the values.
   */
  public static toDataArray(args: {
    cells: t.IGridData['cells'];
    totalColumns: number;
    totalRows: number;
  }) {
    return Array.from({ length: args.totalRows }).map((v, row) =>
      Array.from({ length: args.totalColumns }).map((v, column) => {
        return args.cells[Cell.toKey({ row, column })];
      }),
    );
  }

  /**
   * Converts generic input into a strongly typed INs
   */
  public static toNs(input?: t.INs | string): t.INs {
    const ns = input === undefined ? DEFAULT.NS : typeof input === 'string' ? { id: input } : input;
    ns.id = ns.id.trim().replace(/^ns\:/, '');
    return ns;
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
    this._init(args);
  }

  private _init(args: IGridArgs) {
    const defaults = (this._.defaults = Grid.defaults(args.defaults));

    this._.totalColumns = defaultValue(args.totalColumns, defaults.totalColumns);
    this._.totalRows = defaultValue(args.totalRows, defaults.totalRows);
    this._.ns = Grid.toNs(args.ns);
    this._.cells = args.cells || {};
    this._.columns = args.columns || {};
    this._.rows = args.rows || {};
    this._.calc = calc({ grid: this, getFunc: args.getFunc });

    this.events$
      .pipe(filter(e => e.type === 'GRID/ready'))
      .subscribe(() => (this._.isReady = true));

    /**
     * Keyboard bindings.
     */
    this._.keyBindings = R.uniqBy(R.prop('command'), [
      ...(args.keyBindings || []),
      ...DEFAULT.KEY_BINDINGS,
    ]);

    // Finish up.
    const { table } = args;
    if (table) {
      this.initialize({ table });
    }
  }

  /**
   * Initialize the API with a working table (DOM).
   */
  public initialize(args: { table: Handsontable }) {
    const { table } = args;
    this._.table = table;
    this._.id = `grid/${(table as any).guid.replace(/^ht_/, '')}`;

    /**
     * Initialize behavior controllers.
     */
    keyboard.init({ grid: this });
    commands.init({ grid: this, fire: this.fire });

    /**
     * Debounced redraw.
     */
    this._.redraw$
      .pipe(takeUntil(this.dispose$), debounceTime(0))
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
        ...this.cell(key).data.props,
        value: undefined, // NB: Reset the calculated "display value" as this will be overriden by the new value.
      };
      const cell: t.IGridCellData = { value, props };
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

    // Finish up.
    return this;
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    id: '',
    totalColumns: -1,
    totalRows: -1,
    defaults: (undefined as unknown) as t.IGridDefaults,
    keyBindings: (undefined as unknown) as t.KeyBindings<t.GridCommand>,
    cache: MemoryCache.create(),
    table: (undefined as unknown) as Handsontable,
    dispose$: new Subject<{}>(),
    events$: new Subject<t.GridEvent>(),
    redraw$: new Subject(),
    isReady: false,
    isEditing: false,
    ns: DEFAULT.NS,
    cells: ({} as unknown) as t.IGridData['cells'],
    columns: ({} as unknown) as t.IGridData['columns'],
    rows: ({} as unknown) as t.IGridData['rows'],
    lastSelection: (undefined as unknown) as t.IGridSelection,
    calc: (undefined as unknown) as t.IGridCalculate,
    refs: (undefined as unknown) as t.IRefsTable,
  };

  public clipboard: t.IGridClipboardPending | undefined;

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(takeUntil(this.dispose$), share());
  public readonly keyboard$ = this._.events$.pipe(
    filter(e => e.type === 'GRID/keydown'),
    map(e => e.payload as t.IGridKeydown),
    share(),
  );

  private getValueSync = (key: string) => {
    const cell = this.data.cells[key];
    return cell && typeof cell.value === 'string' ? cell.value : undefined;
  };
  public readonly refsTable = coord.refs.table({
    getKeys: async () => Object.keys(this.data.cells),
    getValue: async key => this.getValueSync(key),
  });

  /**
   * [Properties]
   */
  public get id() {
    return this._.id;
  }

  public get totalColumns() {
    return this._.totalColumns;
  }

  public get totalRows() {
    return this._.totalRows;
  }

  public get defaults() {
    return this._.defaults;
  }

  public get keyBindings() {
    return this._.keyBindings;
  }

  public get isInitialized() {
    return Boolean(this._.table);
  }

  public get isDisposed() {
    return this._.table.isDestroyed || this._.dispose$.isStopped;
  }

  public get isReady() {
    return this.isDisposed ? false : this._.isReady;
  }

  public get isEditing() {
    return this._.isEditing;
  }

  public get data() {
    const { ns, cells, columns, rows } = this._;
    return { ns, cells, columns, rows };
  }

  private setCells(cells: t.IGridData['cells']) {
    cells = { ...cells };
    const totalColumns = this.totalColumns;
    const totalRows = this.totalRows;
    const data = Grid.toDataArray({ cells, totalColumns, totalRows });
    this._.cells = cells;
    this._.table.loadData(data);
  }

  public get calc(): t.IGridCalculate {
    return this._.calc;
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
  public get selectionValues(): t.IGridData['cells'] {
    const cells = this.data.cells;
    const selection = this.selection;
    return toSelectionValues({ cells, selection });
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
   * Merge cells.
   * https://handsontable.com/docs/6.1.1/demo-merged-cells.html
   */
  public mergeCells(args: { cells: t.IGridData['cells']; init?: boolean }) {
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
        const props: t.IGridCellProps = item.props || {};
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

  /**
   * Updates cell values.
   */
  public changeCells(
    cells: t.IGridData['cells'],
    options: { source?: t.GridCellChangeType; silent?: boolean; init?: boolean } = {},
  ) {
    const done = () => this;

    const format = (key: string, to?: t.IGridCellData) => {
      if (Cell.isEmpty(to)) {
        return undefined;
      }
      if (to) {
        to = { ...to, hash: util.gridCellHash(this, key, to) };
        if (Cell.isEmptyProps(to.props)) {
          delete to.props; // Strip any empty props or props with default values.
        }
      }
      return to;
    };

    // NB: If initializing, and no initial values, ensure the grid is loaded.
    if (options.init && cells && Object.keys(cells).length === 0) {
      this.setCells({});
      return done();
    }

    if (cells) {
      // Process input object.
      const current = { ...(options.init ? {} : this.data.cells) };
      cells = { ...cells };

      // Ensure only cells (eg "A1") not rows/columns (eg "B" or "3").
      Object.keys(cells)
        .filter(key => !coord.cell.isCell(key))
        .forEach(key => delete cells[key]);

      // Format incoming values ensuring they are clean and structurally consistent.
      type Values = { [key: string]: { from?: t.IGridCellData; to?: t.IGridCellData } };
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
      const mergeChanges: t.IGridData['cells'] = {};
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
        const isMergeChanged = !R.equals(
          ((from || {}).props || {}).merge,
          ((to || {}).props || {}).merge,
        );
        if (isMergeChanged) {
          mergeChanges[key] = to;
        }
      });

      // Update any cell-merge changes.
      if (Object.keys(mergeChanges).length > 0) {
        this.mergeCells({ cells: mergeChanges });
      }

      // Update the UI.
      this.setCells(updates);
    }

    // Finish up.
    return done();
  }

  /**
   * Updates columns.
   */
  public changeColumns(
    columns: t.IGridData['columns'],
    options: { source?: t.GridColumnChangeType } = {},
  ) {
    const { source = 'UPDATE' } = options;
    const from = { ...this._.columns };
    const to = { ...from };
    let changes: t.IGridColumnChange[] = [];

    Object.keys(columns).forEach(key => {
      const prev = from[key] || { props: { width: -1 } };
      const next = columns[key] || { props: { width: this.defaults.columnWidth } };
      const isDefault = (next.props || {}).width === this.defaults.columnWidth;
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
  public changeRows(rows: t.IGridData['rows'], options: { source?: t.GridColumnChangeType } = {}) {
    const { source = 'UPDATE' } = options;
    const from = { ...this._.rows };
    const to = { ...from };
    let changes: t.IGridRowChange[] = [];

    Object.keys(rows).forEach(key => {
      const prev = from[key] || { props: { height: -1 } };
      const next = rows[key] || { props: { height: this.defaults.rowHeight } };
      const isDefault = (next.props || {}).height === this.defaults.rowHeight;
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
    const ns = this.data.ns.id;
    const cacheKey = `${ns}:cell/${column}:${row}`;
    return this._.cache.get<Cell<t.IGridCellProps>>(cacheKey, () => {
      const table = this._.table;
      return Cell.create({ ns, table, row, column });
    });
  }

  /**
   * Scroll the grids view-port to the given column/row coordinates.
   */
  public scrollTo(args: {
    cell: t.GridCellRef;
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
  public select(args: {
    cell: t.GridCellRef;
    ranges?: t.GridCellRangeKey[];
    scrollToCell?: boolean;
  }) {
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
    const ranges = (last && last.ranges) || [];
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
  public toPosition(ref: t.GridCellRef) {
    const pos = Cell.toPosition(ref);
    const row = R.clamp(0, this.totalRows - 1, pos.row);
    const column = R.clamp(0, this.totalColumns - 1, pos.column);
    return { row, column };
  }

  /**
   * Updates the cell hash for each value.
   */
  public updateHashes(options: { force?: boolean } = {}) {
    const data = this.data;
    const cells = { ...data.cells };

    let isChanged = false;
    Object.keys(cells).forEach(key => {
      const cell = cells[key];
      if (cell) {
        let hash = cell.hash;
        if (!hash || options.force) {
          hash = util.gridCellHash(this, key, cell);
          cells[key] = { ...cell, hash };
          isChanged = true;
        }
      }
    });
    if (isChanged) {
      this.setCells(cells);
    }
    return this;
  }

  public command: t.GridFireCommand = args => {
    const payload: t.IGridCommand = {
      command: args.command,
      grid: this,
      selection: this.selection,
      props: args.props || {},
      isCancelled: false,
      cancel: () => {
        payload.isCancelled = true;
        if (args.cancel) {
          args.cancel();
        }
      },
    };
    this.fire({ type: 'GRID/command', payload });
    return this;
  };

  public fire: t.GridFire = e => {
    this._.events$.next(e);
    return this;
  };
}
