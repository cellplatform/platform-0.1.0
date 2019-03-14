import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { t } from '../../common';

/**
 * Strongly typed properties and methods for programatically manipulating the grid.
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
    this._table = args.table;
  }

  /**
   * [Fields]
   */
  private readonly _table: Handsontable;
  private readonly _events$ = new Subject<t.GridEvent>();
  private readonly _dispose$ = new Subject();

  public readonly dispose$ = this._dispose$.pipe(share());
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._table.isDestroyed || this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */

  /**
   * Disposes of the grid.
   */
  public dispose() {
    if (this._table.isDestroyed) {
      this._table.destroy();
    }
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * Scroll the grids view-port to the given column/row cooridnates.
   */
  public scrollTo(args: {
    column?: number;
    row?: number;
    snapToBottom?: boolean; // (false) If true, viewport is scrolled to show the cell on the bottom of the table.
    snapToRight?: boolean; //  (false) If true, viewport is scrolled to show the cell on the right side of the table.
  }) {
    const { column, row, snapToBottom = false, snapToRight = false } = args;
    if (!this.isDisposed && column !== undefined && row !== undefined) {
      this._table.scrollViewportTo(row, column, snapToBottom, snapToRight);
    }
  }

  /**
   * Fires an event (used internally)
   */
  public next(e: t.GridEvent) {
    this._events$.next(e);
  }
}
