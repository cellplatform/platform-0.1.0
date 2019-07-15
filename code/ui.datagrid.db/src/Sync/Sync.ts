import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { t, R, value, time } from '../common';
import { Keys } from '../keys';

export type ISyncArgs = {
  db: t.IDb;
  grid: t.IGrid;
  loadGrid?: boolean;
  events$?: Subject<t.SyncEvent>;
};

type GridPart = 'CELLS' | 'COLUMNS' | 'ROWS';
type IActivityFlags<F> = {
  currently(...part: F[]): boolean;
  add(part: F): void;
  remove(part: F): void;
};

/**
 * Manages syncing a DB and Grid.
 */
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
    const events$ = this.events$.pipe(takeUntil(this._dispose$));

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

    const syncing$ = events$.pipe(
      filter(e => e.type === 'DB/syncing'),
      map(e => e.payload as t.ISyncing),
    );

    /**
     * `Cell Sync`
     */
    gridCellChanges$
      // Cells changed in Grid UI.
      .pipe(filter(e => !this.is.loading.currently('CELLS')))
      .subscribe(async e => {
        e.changes.forEach(change => {
          this.fireSyncing({
            source: 'GRID',
            kind: 'CELL',
            key: this.keys.grid.toCellKey(change.cell.key),
            value: change.value.to,
          });
        });
      });

    dbChange$
      // Cell changed in DB.
      .pipe(
        filter(e => e.key.startsWith('cell/')),
        filter(e => !this.is.loading.currently('CELLS')),
      )
      .subscribe(e => {
        this.fireSyncing({
          source: 'DB',
          kind: 'CELL',
          key: this.keys.grid.toCellKey(e.key),
          value: e.value,
        });
      });

    syncing$
      // Update DB when Grid UI changes a cell.
      .pipe(
        filter(e => e.source === 'GRID'),
        filter(e => e.kind === 'CELL'),
      )
      .subscribe(async e => {
        const key = this.keys.db.toCellKey(e.key);
        const existing = await db.getValue(key);
        if (!R.equals(existing, e.value)) {
          await db.put(key, e.value as t.Json);
        }
      });

    syncing$
      // Update Grid UI when the DB changes a cell.
      .pipe(
        filter(e => e.source === 'DB'),
        filter(e => e.kind === 'CELL'),
      )
      .subscribe(async e => {
        const cell = grid.cell(this.keys.grid.toCellKey(e.key));
        if (!R.equals(e.value, cell.value)) {
          cell.value = e.value;
        }
      });

    /**
     * `Column Sync`
     */
    gridColumnsChanges$
      // Columns changed in Grid UI.
      .pipe(filter(e => !this.is.loading.currently('COLUMNS')))
      .subscribe(async e => {
        e.changes.forEach(change => {
          this.fireSyncing({
            source: 'GRID',
            kind: 'COLUMN',
            key: this.keys.grid.toColumnKey(change.column),
            value: change.to,
          });
        });
      });

    dbChange$
      // Column changed in DB.
      .pipe(
        filter(e => e.key.startsWith('column/')),
        filter(e => !this.is.loading.currently('COLUMNS')),
      )
      .subscribe(e => {
        this.fireSyncing({
          source: 'DB',
          kind: 'COLUMN',
          key: this.keys.grid.toColumnKey(e.key),
          value: e.value as t.IGridColumn,
        });
      });

    syncing$
      // Update DB when Grid UI changes a column.
      .pipe(
        filter(e => e.source === 'GRID'),
        filter(e => e.kind === 'COLUMN'),
      )
      .subscribe(async e => {
        const key = this.keys.db.toColumnKey(e.key);
        const existing = await db.getValue(key);
        if (!R.equals(existing, e.value)) {
          await db.put(key, e.value as t.Json);
        }
      });

    syncing$
      // Update Grid UI when the DB changes a column.
      .pipe(
        filter(e => e.source === 'DB'),
        filter(e => e.kind === 'COLUMN'),
      )
      .subscribe(async e => {
        const key = this.keys.grid.toColumnKey(e.key);
        const column = grid.columns[key];
        if (!R.equals(e.value, column)) {
          grid.changeColumns({ [key]: e.value as t.IGridColumn });
          grid.redraw();
        }
      });

    /**
     * `Row Sync`
     */
    gridRowsChanges$
      // Rows changed in Grid UI.
      .pipe(filter(e => !this.is.loading.currently('ROWS')))
      .subscribe(async e => {
        e.changes.forEach(change => {
          const key = this.keys.grid.toRowKey(change.row);
          this.fireSyncing({
            source: 'GRID',
            kind: 'ROW',
            key,
            value: change.to,
          });
        });
      });

    dbChange$
      // Row changed in DB.
      .pipe(
        filter(e => e.key.startsWith('row/')),
        filter(e => !this.is.loading.currently('ROWS')),
      )
      .subscribe(e => {
        this.fireSyncing({
          source: 'DB',
          kind: 'ROW',
          key: this.keys.grid.toRowKey(e.key),
          value: e.value as t.IGridRow,
        });
      });

    syncing$
      // Update DB when Grid UI changes a row.
      .pipe(
        filter(e => e.source === 'GRID'),
        filter(e => e.kind === 'ROW'),
      )
      .subscribe(async e => {
        const key = this.keys.db.toRowKey(e.key);
        const existing = await db.getValue(key);
        if (!R.equals(existing, e.value)) {
          await db.put(key, e.value as t.Json);
        }
      });

    syncing$
      // Update Grid UI when the DB changes a row.
      .pipe(
        filter(e => e.source === 'DB'),
        filter(e => e.kind === 'ROW'),
      )
      .subscribe(async e => {
        const key = this.keys.grid.toRowKey(e.key);
        const row = grid.rows[key];
        if (!R.equals(e.value, row)) {
          grid.changeRows({ [key]: e.value as t.IGridRow });
          grid.redraw();
        }
      });

    /**
     * Finish up.
     */
    if (loadGrid) {
      time.delay(0, () => this.load());
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

  private is = {
    loading: flags<GridPart>(),
    changingByGrid: flags<{ key: string; part: GridPart }>(),
  };

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
    await Promise.all([this.loadCells(), this.loadColumns(), this.loadRows()]);
    this.grid.redraw();
  }

  public async loadCells() {
    if (this.is.loading.currently('CELLS')) {
      return;
    }
    this.is.loading.add('CELLS');

    const cells = await this.db.find(`${this.keys.db.prefix.cell}*`);
    const values = cells.list.reduce((acc, next) => {
      const key = this.keys.grid.toCellKey(next.props.key);
      acc[key] = next.value;
      return acc;
    }, {});

    this.grid.values = values;
    this.is.loading.remove('CELLS');
  }

  public async loadColumns() {
    if (this.is.loading.currently('COLUMNS')) {
      return;
    }
    this.is.loading.add('COLUMNS');

    const columns = await this.db.find(`${this.keys.db.prefix.column}*`);
    const values = columns.list.reduce((acc, next) => {
      const key = this.keys.grid.toColumnKey(next.props.key);
      acc[key] = next.value;
      return acc;
    }, {});

    this.grid.columns = values;
    this.is.loading.remove('COLUMNS');
  }

  public async loadRows() {
    if (this.is.loading.currently('ROWS')) {
      return;
    }
    this.is.loading.add('ROWS');

    const rows = await this.db.find(`${this.keys.db.prefix.row}*`);
    const values = rows.list.reduce((acc, next) => {
      const key = this.keys.grid.toRowKey(next.props.key);
      acc[key] = next.value;
      return acc;
    }, {});

    this.grid.rows = values;
    this.is.loading.remove('ROWS');
  }

  /**
   * [Helpers]
   */
  private fire(e: t.SyncEvent) {
    this._events$.next(e);
  }

  private fireSyncing(payload: t.SyncChangeType) {
    this.fire({
      type: 'DB/syncing',
      payload,
    });
  }
}

/**
 * [Helpers]
 */

const flags = <F>(): IActivityFlags<F> => {
  let flags: F[] = [];
  return {
    currently(...input: F[]) {
      return input.length === 0 && input.length > 0
        ? true
        : input.some(flag => flags.includes(flag));
    },
    add(flag: F) {
      flags = [...flags, flag];
    },
    remove(flag: F) {
      const index = flags.indexOf(flag);
      if (index > -1) {
        flags = [...flags.slice(0, index), ...flags.slice(index + 1)];
      }
    },
  };
};
