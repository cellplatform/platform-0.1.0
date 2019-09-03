import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { t, R, rx } from '../common';
import { SyncSchema } from '../schema';

export type ISyncArgs = {
  db: t.IDb;
  grid: t.IGrid;
  events$?: Subject<t.SyncEvent>;
  schema?: SyncSchema;
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
  public static schema = SyncSchema.create;

  /**
   * [Fields]
   */
  public readonly grid: t.IGrid;
  public readonly db: t.IDb;
  private readonly schema: SyncSchema;

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
   * [Lifecycle]
   */
  public static create = (args: ISyncArgs) => new Sync(args);
  private constructor(args: ISyncArgs) {
    const { db, grid } = args;
    const events$ = this.events$.pipe(takeUntil(this._dispose$));

    // Store refs;
    this.db = db;
    this.grid = grid;
    this.schema = args.schema || SyncSchema.create({});

    // Bubble events.
    const bubble$ = args.events$;
    if (bubble$) {
      // NB: Not passed directly to [subscribe] to event it being stopped upon sync dispose.
      this.events$.subscribe(e => bubble$.next(e));
    }

    // Setup observables.
    const db$ = db.events$.pipe(takeUntil(this.dispose$));
    const dbChange$ = db$.pipe(
      filter(e => e.type === 'DOC/change'),
      map(e => e.payload as t.IDbActionChange),
    );

    const grid$ = grid.events$.pipe(takeUntil(this.dispose$));
    const gridCellsChanges$ = grid$.pipe(
      filter(e => e.type === 'GRID/cells/changed'),
      map(e => e.payload as t.IGridCellsChanged),
    );
    const gridColumnsChanges$ = grid$.pipe(
      filter(e => e.type === 'GRID/columns/changed'),
      map(e => e.payload as t.IGridColumnsChanged),
    );
    const gridRowsChanges$ = grid$.pipe(
      filter(e => e.type === 'GRID/rows/changed'),
      map(e => e.payload as t.IGridRowsChanged),
    );
    const syncChange$ = events$.pipe(
      filter(e => e.type === 'SYNC/change'),
      map(e => e.payload as t.SyncChangeType),
    );

    /**
     * Buffer writes to the DB.
     */
    const save$ = new Subject<{ kind: t.GridCellType; key: string; value?: any }>();
    rx.debounceBuffer(save$.pipe(takeUntil(this.dispose$)), 0).subscribe(async e => {
      // Get the latest value for each of the buffered changes.
      const grouped = R.groupBy(R.prop('key'), e);
      const latest = Object.keys(grouped)
        .map(key => grouped[key][grouped[key].length - 1])
        .map(item => ({ ...item, value: this.formatValue(item.value) }));

      // Extract distinct lists for delete/update operations.
      const deletes = latest
        .filter(item => isEmptyValue(item.value))
        .map(item => ({ key: item.key }));
      const updates = latest.filter(item => !isEmptyValue(item.value));

      // Write to DB.
      if (deletes.length > 0) {
        await this.db.deleteMany(deletes.map(item => item.key));
      }
      if (updates.length > 0) {
        await this.db.putMany(updates);
      }

      // Alert listeners.
      this.fire({ type: 'SYNCED/db', payload: { updates, deletes } });
    });

    /**
     * Buffer updates to the Grid UI.
     */
    const changeGrid$ = new Subject<{ type: t.GridCellType; key: string; value?: any }>();
    rx.debounceBuffer(changeGrid$.pipe(takeUntil(this.dispose$)), 0).subscribe(async e => {
      const cells = e.filter(({ type }) => type === 'CELL');
      const columns = e.filter(({ type }) => type === 'COLUMN');
      const rows = e.filter(({ type }) => type === 'ROW');

      const isChanged = columns.length > 0 || rows.length > 0 || cells.length > 0;
      if (!isChanged) {
        return;
      }

      // Build change-sets.
      const changes = { columns: {}, rows: {}, cells: {} };

      if (columns.length > 0) {
        changes.columns = columns.reduce((acc, next) => {
          acc[next.key] = next.value;
          return acc;
        }, {});
      }

      if (rows.length > 0) {
        changes.rows = rows.reduce((acc, next) => {
          acc[next.key] = next.value;
          return acc;
        }, {});
      }

      if (cells.length > 0) {
        changes.cells = cells.reduce((acc, next) => {
          acc[next.key] = next.value;
          return acc;
        }, {});
      }

      // Pass changes to the grid.
      const values = {
        ...grid.values,
        ...changes.columns,
        ...changes.rows,
        ...changes.cells,
      };
      grid.values = values;

      // Alert listeners.
      this.fire({ type: 'SYNCED/grid', payload: { updates: e } });
    });

    /**
     * `Cell Sync`
     */
    (() => {
      gridCellsChanges$
        // Cells changed in Grid UI.
        .pipe(filter(e => !this.is.loading.currently('CELLS')))
        .subscribe(async e => {
          e.changes.forEach(change => {
            const key = this.schema.grid.toCellKey(change.cell.key);
            this.fireSync({
              source: 'GRID',
              kind: 'CELL',
              key,
              value: change.value.to,
            });
          });
        });

      dbChange$
        // Cell changed in DB.
        .pipe(
          filter(e => this.schema.db.is.cell(e.key)),
          filter(e => !this.is.loading.currently('CELLS')),
        )
        .subscribe(e => {
          const key = this.schema.grid.toCellKey(e.key);
          this.fireSync({
            source: 'DB',
            kind: 'CELL',
            key,
            value: e.value,
          });
        });

      syncChange$
        // Update DB when Grid UI changes a cell.
        .pipe(
          filter(e => e.source === 'GRID'),
          filter(e => e.kind === 'CELL'),
        )
        .subscribe(async e => {
          const key = this.schema.db.toCellKey(e.key);
          const existing = await db.getValue(key);
          if (!R.equals(existing, e.value)) {
            save$.next({ kind: 'CELL', key, value: e.value });
          }
        });

      syncChange$
        // Update Grid UI when the DB changes a cell.
        .pipe(
          filter(e => e.source === 'DB'),
          filter(e => e.kind === 'CELL'),
        )
        .subscribe(async e => {
          const key = this.schema.grid.toCellKey(e.key);
          const cell = grid.cell(key);
          if (!R.equals(e.value, cell.value)) {
            changeGrid$.next({ type: 'CELL', key, value: e.value });
          }
        });
    })();

    /**
     * `Column Sync`
     */
    (() => {
      gridColumnsChanges$
        // Columns changed in Grid UI.
        .pipe(filter(e => !this.is.loading.currently('COLUMNS')))
        .subscribe(async e => {
          e.changes.forEach(change => {
            const key = this.schema.grid.toColumnKey(change.column);
            this.fireSync({
              source: 'GRID',
              kind: 'COLUMN',
              key,
              value: change.to,
            });
          });
        });

      dbChange$
        // Column changed in DB.
        .pipe(
          filter(e => this.schema.db.is.column(e.key)),
          filter(e => !this.is.loading.currently('COLUMNS')),
        )
        .subscribe(e => {
          const key = this.schema.grid.toColumnKey(e.key);
          this.fireSync({
            source: 'DB',
            kind: 'COLUMN',
            key,
            value: e.value as t.IGridColumn,
          });
        });

      syncChange$
        // Update DB when Grid UI changes a column.
        .pipe(
          filter(e => e.source === 'GRID'),
          filter(e => e.kind === 'COLUMN'),
        )
        .subscribe(async e => {
          const key = this.schema.db.toColumnKey(e.key);
          const existing = await db.getValue(key);
          if (!R.equals(existing, e.value)) {
            save$.next({ kind: 'COLUMN', key, value: e.value });
          }
        });

      syncChange$
        // Update Grid UI when the DB changes a column.
        .pipe(
          filter(e => e.source === 'DB'),
          filter(e => e.kind === 'COLUMN'),
        )
        .subscribe(async e => {
          const key = this.schema.grid.toColumnKey(e.key);
          const column = grid.columns[key];
          if (!R.equals(e.value, column)) {
            changeGrid$.next({ type: 'COLUMN', key, value: e.value });
          }
        });
    })();

    /**
     * `Row Sync`
     */
    (() => {
      gridRowsChanges$
        // Rows changed in Grid UI.
        .pipe(filter(e => !this.is.loading.currently('ROWS')))
        .subscribe(async e => {
          e.changes.forEach(change => {
            const key = this.schema.grid.toRowKey(change.row);
            this.fireSync({
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
          filter(e => this.schema.db.is.row(e.key)),
          filter(e => !this.is.loading.currently('ROWS')),
        )
        .subscribe(e => {
          const key = this.schema.grid.toRowKey(e.key);
          this.fireSync({
            source: 'DB',
            kind: 'ROW',
            key,
            value: e.value as t.IGridRow,
          });
        });

      syncChange$
        // Update DB when Grid UI changes a row.
        .pipe(
          filter(e => e.source === 'GRID'),
          filter(e => e.kind === 'ROW'),
        )
        .subscribe(async e => {
          const key = this.schema.db.toRowKey(e.key);
          const existing = await db.getValue(key);
          if (!R.equals(existing, e.value)) {
            save$.next({ kind: 'ROW', key, value: e.value });
          }
        });

      syncChange$
        // Update Grid UI when the DB changes a row.
        .pipe(
          filter(e => e.source === 'DB'),
          filter(e => e.kind === 'ROW'),
        )
        .subscribe(async e => {
          const key = this.schema.grid.toRowKey(e.key);
          const row = grid.rows[key];
          if (!R.equals(e.value, row)) {
            changeGrid$.next({ type: 'ROW', key, value: e.value });
          }
        });
    })();
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

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

    const cells = await this.db.find(this.schema.db.all.cells);
    const values = cells.list.reduce((acc, next) => {
      const key = this.schema.grid.toCellKey(next.props.key);
      const value = next.value;
      acc[key] = typeof value === 'object' ? value : { value };
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

    const columns = await this.db.find(this.schema.db.all.columns);
    const values = columns.list.reduce((acc, next) => {
      const key = this.schema.grid.toColumnKey(next.props.key);
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

    const rows = await this.db.find(this.schema.db.all.rows);
    const values = rows.list.reduce((acc, next) => {
      const key = this.schema.grid.toRowKey(next.props.key);

      // Ensure is within bounds for rows.
      if (key === '0') {
        return acc;
      }

      acc[key] = next.value;
      return acc;
    }, {});

    this.grid.rows = values;
    this.is.loading.remove('ROWS');
  }

  /**
   * Deletes all "empty" values from the database.
   */
  public async compact() {
    const getEmptyKeys = async (kind: t.GridCellType, query: string) => {
      const res = await this.db.find(query);
      const empty = res.list.filter(
        item =>
          isEmptyValue(item.value) ||
          this.isDefaultValue({
            kind,
            key: item.props.key,
            value: item.value,
          }),
      );
      return empty.map(item => item.props.key);
    };

    const res = await Promise.all([
      getEmptyKeys('CELL', this.schema.db.all.cells),
      getEmptyKeys('ROW', this.schema.db.all.rows),
      getEmptyKeys('COLUMN', this.schema.db.all.columns),
    ]);
    const keys = R.flatten<string>(res);

    await this.db.deleteMany(keys);
    return { deleted: keys };
  }

  /**
   * [Helpers]
   */

  private fire(e: t.SyncEvent) {
    this._events$.next(e);
  }

  private fireSync(payload: t.SyncChangeType) {
    const { kind, key } = payload;

    let value = this.formatValue(payload.value);
    value = this.isDefaultValue({ kind, key, value }) ? undefined : value;

    this.fire({
      type: 'SYNC/change',
      payload: { ...payload, value },
    });
  }

  private formatValue = (value?: any) => {
    value = isEmptyValue(value) ? undefined : value;
    return value;
  };

  private isDefaultValue = (e: { kind: t.GridCellType; key: string; value?: any }) => {
    const defaults = this.grid.defaults;
    switch (e.kind) {
      case 'COLUMN':
        return R.equals(e.value, { width: defaults.columWidth });
      case 'ROW':
        return R.equals(e.value, { height: defaults.rowHeight });

      case 'CELL':
      default:
        return isEmptyValue(e.value);
    }
  };
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

function isEmptyValue(value?: any) {
  return value === '' || value === undefined;
}
