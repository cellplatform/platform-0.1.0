import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { Cell } from './Cell';

/**
 * Strongly typed properties and methods for
 * programatically manipulating the grid.
 */
export class Grid {
  /**
   * [Static]
   */
  public static create(args: { table: Handsontable }) {
    return new Grid(args);
  }

  /**
   * [Constructor]
   */
  private constructor(args: { table: Handsontable }) {
    this._.table = args.table;

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
  };

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

  public get isEditing() {
    return this._.isEditing;
  }

  /**
   * [Methods]
   */

  public TMP() {
    const table = this._.table;
    const data = [['FOO']];

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
   * Fires an event (used internally)
   */
  public next(e: t.GridEvent) {
    this._.events$.next(e);
  }
}
