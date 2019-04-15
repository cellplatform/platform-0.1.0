import { cell as util } from '@platform/util.value.cell';
import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { t, value, constants } from '../common';

const { KEY } = constants;

export type ISyncArgs = {
  db: t.IDb;
  grid: t.IGrid;
  loadGrid?: boolean;
};

export class Sync {
  /**
   * [Static]
   */
  public static create(args: ISyncArgs) {
    return new Sync(args);
  }

  public static toDbCellKey(key: string | { key: string }) {
    return toDbKey(KEY.PREFIX.CELL, key);
  }

  public static toDbColumnKey(key: number | string) {
    key = typeof key === 'number' ? util.toKey(key) : key;
    return toDbKey(KEY.PREFIX.COLUMN, key);
  }

  public static toDbRowKey(key: number | string) {
    return toDbKey(KEY.PREFIX.ROW, key);
  }

  public static toGridCellKey(key: string) {
    return lastPart(key, '/').toUpperCase();
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: ISyncArgs) {
    const { db, grid } = args;
    const loadGrid = value.defaultValue(args.loadGrid, true);

    // Store refs;
    this.db = db;
    this.grid = grid;

    // Setup observables.
    const grid$ = grid.events$.pipe(takeUntil(this.dispose$));
    const gridChanges$ = grid$.pipe(
      filter(e => e.type === 'GRID/cell/change/set'),
      map(e => e.payload as t.IGridCellChangeSet),
    );
    const db$ = db.events$.pipe(takeUntil(this.dispose$));

    /**
     * Save to DB when grid cells are edited.
     */
    gridChanges$.subscribe(async e => {
      const list = e.changes.map(change => ({
        key: Sync.toDbCellKey(change.cell),
        value: change.value.to,
      }));
      await db.update(list);
    });

    /**
     * Watch for DB changes.
     */
    db.watch('cell/');
    db$
      .pipe(
        filter(e => e.type === 'DB/watch'),
        map(e => e.payload as t.IDbWatchChange),
      )
      .subscribe(e => {
        const key = Sync.toGridCellKey(e.key.toString());
        grid.cell(key).value = e.value.to;
      });

    // Finish up.
    if (loadGrid) {
      this.loadGrid();
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
      .map(key => ({ key: Sync.toGridCellKey(key), value: cells[key].value }))
      .reduce((acc, next) => {
        acc[next.key] = next.value;
        return acc;
      }, {});
    this.grid.values = values;
  }
}

/**
 * [Helpers]
 */
function lastPart(text: string, delimiter: string) {
  const parts = (text || '').split(delimiter);
  return parts[parts.length - 1];
}

function toDbKey(prefix: string, key: string | number | { key: string }) {
  key = typeof key === 'object' ? key.key : (key || '').toString();
  key = lastPart(key, '/');
  return !key ? '' : `${prefix}${key}`;
}
