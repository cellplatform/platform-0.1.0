import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t, value } from '../common';
import { Keys } from '../keys';

export type ISyncArgs = {
  db: t.IDb;
  grid: t.IGrid;
  loadGrid?: boolean;
  events$?: Subject<t.SyncEvent>;
};

export class Sync implements t.IDisposable {
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
    this.keys = Keys.create({});

    // Bubble events.
    if (args.events$) {
      this.events$.subscribe(args.events$);
    }

    // Setup observables.
    const db$ = db.events$.pipe(takeUntil(this.dispose$));
    const dbChange$ = db$.pipe(
      filter(e => e.type === 'DOC/change'),
      map(e => e.payload as t.IDbActionChange),
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

    const fireGridChange = (data: t.ISyncGridChange) => {
      let isCancelled = false;
      this.fire({
        type: 'SYNC/changed/grid',
        payload: {
          ...data,
          get isCancelled() {
            return isCancelled;
          },
          cancel() {
            isCancelled = true;
          },
        },
      });

      return { isCancelled };
    };

    /**
     * Save to DB when grid is edited.
     */
    gridCellChanges$.subscribe(async e => {
      const changes = e.changes.map(change => ({
        key: this.keys.db.toCellKey(change.cell),
        value: change.value.to as t.Json,
      }));
      const res = fireGridChange({ kind: 'cells', changes });
      if (!res.isCancelled) {
        await db.putMany(changes);
      }
    });

    gridColumnsChanges$.subscribe(async e => {
      const changes = e.changes.map(change => ({
        key: this.keys.db.toColumnKey(change.column),
        value: change.to,
      }));
      const res = fireGridChange({ kind: 'columns', changes });
      if (!res.isCancelled) {
        await db.putMany(changes);
      }
    });

    gridRowsChanges$.subscribe(async e => {
      const changes = e.changes.map(change => ({
        key: this.keys.db.toRowKey(change.row),
        value: change.to,
      }));
      const res = fireGridChange({ kind: 'rows', changes });
      if (!res.isCancelled) {
        await db.putMany(changes);
      }
    });

    /**
     * Watch for DB changes and update grid.
     */
    // db.watch('cell/');
    dbChange$
      // Cell change.
      .pipe(filter(e => e.key.startsWith('cell/')))
      .subscribe(e => {
        const key = this.keys.grid.toCellKey(e.key.toString());
        const value = e.value;

        let isCancelled = false;
        this.fire({
          type: 'GRID/sync/changed/db/cell',
          payload: {
            cell: { key, value },
            get isCancelled() {
              return isCancelled;
            },
            cancel() {
              isCancelled = true;
            },
          },
        });

        if (!isCancelled) {
          grid.cell(key).value = value;
        }
      });

    // Finish up.
    if (loadGrid) {
      this.load();
    }
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  public readonly grid: t.IGrid;
  public readonly db: t.IDb;
  private keys!: Keys;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.SyncEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */
  public async load() {
    await Promise.all([this.loadGrid(), this.loadColumns(), this.loadRows()]);
    this.grid.redraw();
  }

  public async loadGrid() {
    const pattern = this.keys.db.prefix.cell;
    const cells = await this.db.find({ pattern });
    const values = cells.list.reduce((acc, next) => {
      const key = this.keys.grid.toCellKey(next.props.key);
      acc[key] = next.value;
      return acc;
    }, {});
    this.grid.values = values;
  }

  public async loadColumns() {
    const pattern = this.keys.db.prefix.column;
    const columns = await this.db.find({ pattern });
    const values = columns.list.reduce((acc, next) => {
      const key = this.keys.grid.toColumnKey(next.props.key);
      acc[key] = next.value;
      return acc;
    }, {});
    this.grid.columns = values;
  }

  public async loadRows() {
    const pattern = this.keys.db.prefix.row;
    const rows = await this.db.find({ pattern });
    const values = rows.list.reduce((acc, next) => {
      const key = this.keys.grid.toRowKey(next.props.key);
      acc[key] = next.value;
      return acc;
    }, {});
    this.grid.rows = values;
  }

  /**
   * [Helpers]
   */
  private fire(e: t.SyncEvent) {
    this._events$.next(e);
  }
}
