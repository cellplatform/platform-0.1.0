import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { constants, t, value } from '../common';
import * as keys from './keys';

const { KEY } = constants;

export type ISyncArgs = {
  db: t.IDb;
  grid: t.IGrid;
  initGrid?: boolean;
};

export class Sync {
  /**
   * [Static]
   */
  public static create(args: ISyncArgs) {
    return new Sync(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: ISyncArgs) {
    const { db, grid } = args;
    const loadGrid = value.defaultValue(args.initGrid, true);

    // Store refs;
    this.db = db;
    this.grid = grid;

    // Setup observables.
    const db$ = db.events$.pipe(takeUntil(this.dispose$));
    const dbWatch$ = db$.pipe(
      filter(e => e.type === 'DB/watch'),
      map(e => e.payload as t.IDbWatchChange),
    );

    const grid$ = grid.events$.pipe(takeUntil(this.dispose$));
    const gridCellChanges$ = grid$.pipe(
      filter(e => e.type === 'GRID/cell/change/set'),
      map(e => e.payload as t.IGridCellChangeSet),
    );
    const gridColumnsChanges$ = grid$.pipe(
      filter(e => e.type === 'GRID/columns/changed'),
      map(e => e.payload as t.IColumnsChanged),
    );
    const gridRowsChanges$ = grid$.pipe(
      filter(e => e.type === 'GRID/rows/changed'),
      map(e => e.payload as t.IRowsChanged),
    );

    /**
     * Save to DB when grid cells are edited.
     */
    gridCellChanges$.subscribe(async e => {
      const list = e.changes.map(change => ({
        key: keys.toDbCellKey(change.cell),
        value: change.value.to,
      }));
      await db.putMany(list);
    });

    gridColumnsChanges$.subscribe(async e => {
      const list = e.changes.map(change => ({
        key: keys.toDbColumnKey(change.column),
        value: change.to,
      }));
      await db.putMany(list);
    });

    gridRowsChanges$.subscribe(async e => {
      const list = e.changes.map(change => ({
        key: keys.toDbRowKey(change.row),
        value: change.to,
      }));
      await db.putMany(list);
    });

    /**
     * Watch for DB changes.
     */
    db.watch('cell/');
    dbWatch$.pipe(filter(e => e.pattern === 'cell/')).subscribe(e => {
      const key = keys.toGridCellKey(e.key.toString());
      grid.cell(key).value = e.value.to;
    });

    // Finish up.
    if (loadGrid) {
      this.loadGrid();
      this.loadColumns();
      this.loadRows();
    }
  }

  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    dispose$: new Subject(),
    events$: new Subject<t.SyncEvent>(),
  };
  public readonly grid: t.IGrid;
  public readonly db: t.IDb;

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  /**
   * [Methods]
   */

  public async loadGrid() {
    const cells = await this.db.values({ pattern: KEY.PREFIX.CELL });
    const values = Object.keys(cells)
      .map(key => ({ key: keys.toGridCellKey(key), value: cells[key].value }))
      .reduce((acc, next) => {
        acc[next.key] = next.value;
        return acc;
      }, {});
    this.grid.values = values;
  }

  public async loadColumns() {
    const columns = await this.db.values({ pattern: KEY.PREFIX.COLUMN });
    const values = Object.keys(columns)
      .map(key => ({ key: keys.toGridColumnKey(key), value: columns[key].value }))
      .reduce((acc, next) => {
        acc[next.key] = next.value;
        return acc;
      }, {});
    this.grid.columns = values;
  }

  public async loadRows() {
    const rows = await this.db.values({ pattern: KEY.PREFIX.ROW });
    const values = Object.keys(rows)
      .map(key => ({ key: keys.toGridRowKey(key), value: rows[key].value }))
      .reduce((acc, next) => {
        acc[next.key] = next.value;
        return acc;
      }, {});
    this.grid.rows = values;
  }
}
