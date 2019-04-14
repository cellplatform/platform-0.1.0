import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { t, value } from '../common';

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
        key: this.toDbCellKey(change.cell),
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
        const key = this.toGridCellKey(e.key.toString());
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
    const cells = await this.db.values({ pattern: 'cell/' });
    const values = Object.keys(cells)
      .map(key => ({ key: this.toGridCellKey(key), value: cells[key].value }))
      .reduce((acc, next) => {
        acc[next.key] = next.value;
        return acc;
      }, {});
    this.grid.values = values;
  }

  /**
   * [Helpers]
   */
  private toDbCellKey(key: string | t.ICell) {
    key = typeof key === 'object' ? key.key : key;
    return `cell/${key}`;
  }

  private toGridCellKey(key: string) {
    return key.replace(/^cell\//, '');
  }
}
