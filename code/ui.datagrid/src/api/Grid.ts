import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';
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
   * Converts the values
   */
  public static toDataArray(args: {
    values: t.IGridValues;
    totalColumns: number;
    totalRows: number;
  }) {
    const { totalColumns, totalRows } = args;
    return Array.from({ length: totalRows }).map((v, row) =>
      Array.from({ length: totalColumns }).map((v, column) => {
        // return { foo: 123 } as any;
        return '';
        // return Cell.toKey({ row, column });
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

    this.events$
      .pipe(filter(e => e.type === 'GRID/EDITOR/begin'))
      .subscribe(() => (this._.isEditing = true));

    this.events$
      .pipe(filter(e => e.type === 'GRID/EDITOR/end'))
      .subscribe(() => (this._.isEditing = false));
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

  /**
   * [Methods]
   */

  /**
   * Loads values into the grid.
   */
  public loadValues() {
    const data = this.toDataArray();
    const table = this._.table;
    table.loadData(data);
  }

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
   * Retrieves an API for working with a single cell.
   */
  public cell(args: { row: number; column: number }) {
    const { row, column } = args;
    return Cell.create({ table: this._.table, row, column });
  }

  /**
   * Scroll the grids view-port to the given column/row cooridnates.
   */
  public scrollTo(args: {
    row?: number;
    column?: number;
    snapToBottom?: boolean; // (false) If true, viewport is scrolled to show the cell on the bottom of the table.
    snapToRight?: boolean; //  (false) If true, viewport is scrolled to show the cell on the right side of the table.
  }) {
    const { column, row, snapToBottom = false, snapToRight = false } = args;
    if (!this.isDisposed && column !== undefined && row !== undefined) {
      this._.table.scrollViewportTo(row, column, snapToBottom, snapToRight);
    }
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
