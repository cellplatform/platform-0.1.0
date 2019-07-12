/**
 * NOTIFY event stream
 * - https://github.com/andywer/pg-listen
 * - https://www.postgresql.org/docs/current/sql-notify.html
 * - https://www.postgresql.org/docs/current/sql-listen.html
 */

import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { R, t, pg, defaultValue, time, value as valueUtil } from '../common';

export type IPgDocArgs = {
  db: pg.PoolConfig;
};

type IRow = { id: number; path: string; data: t.Json; createdAt: number; modifiedAt: number };

/**
 * A file-system like document store backed by Postgres.
 */
export class PgDoc implements t.IDb {
  /**
   * [Static]
   */
  public static create(args: IPgDocArgs) {
    const db = new PgDoc(args);
    return db;
  }

  public static parseKey(key: string, options: { requirePath?: boolean } = {}) {
    key = (key || '').trim().replace(/^\/*/, '');
    const index = key.indexOf('/');
    const table = index > -1 ? key.substring(0, index).trim() : key;
    const path = key
      .substr(table.length)
      .replace(/\/*$/, '')
      .trim();

    if (!table) {
      throw new Error(`The key path does not have a root table name: ${key}`);
    }

    if (!path && defaultValue(options.requirePath, true)) {
      throw new Error(`The key for table '${table}' does not have path name: ${key}`);
    }

    if (path.includes('//')) {
      throw new Error(`The key path contains "//": ${key}`);
    }

    /**
     * TODO
     * - ensure valid characters (??)
     * - no:
     *    - quote markes "" or ''
     *    - anything that the file-system rejects (OSX)
     */

    return {
      table,
      path,
      toString: () => key,
    };
  }

  public static join(...parts: string[]) {
    return parts.map(part => part.replace(/^\/*/, '').replace(/\/*$/, '')).join('/');
  }

  private static toTimestamps(row?: IRow) {
    const createdAt = valueUtil.toNumber(row ? row.createdAt : -1);
    const modifiedAt = valueUtil.toNumber(row ? row.modifiedAt : -1);
    return { createdAt, modifiedAt };
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IPgDocArgs) {
    this._args = args;
    this.pool = new pg.Pool(args.db);
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
    this.pool.end();
  }
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Fields]
   */
  private readonly _args: IPgDocArgs;
  private readonly pool: pg.Pool;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.DbEvent>();
  public readonly events$ = this._events$.pipe(share());

  /**
   * [Methods]
   */
  public async get(key: string): Promise<t.IDbValue> {
    this.throwIfDisposed('get');
    return (await this.getMany([key]))[0];
  }
  public async getMany(keys: string[]): Promise<t.IDbValue[]> {
    this.throwIfDisposed('getMany');
    keys = R.uniq(keys);
    await this.ensureTables(keys);
    const res = await Promise.all(
      keys
        .map(key => PgDoc.parseKey(key))
        .map(async key => {
          const sql = `SELECT * FROM "${key.table}" WHERE path = '${key.path}'`;
          const res = await this.pool.query(sql);
          const { rows } = res;
          return { rows, path: key.toString() };
        }),
    );

    const rows: IRow[] = R.flatten(
      res.map(query => query.rows.map(row => ({ ...row, path: query.path }))),
    );

    return keys.map(key => {
      const row = rows.find(item => item.path === key);
      const value = row && typeof row.data === 'object' ? (row.data as any).data : undefined;
      const exists = Boolean(value);
      const { createdAt, modifiedAt } = PgDoc.toTimestamps(row);
      const res: t.IDbValue = {
        value,
        props: { key, exists, createdAt, modifiedAt },
      };
      return res;
    });
  }
  public async getValue<T extends t.Json | undefined>(key: string): Promise<T> {
    this.throwIfDisposed('putValue');
    const res = await this.get(key);
    return (res ? res.value : undefined) as T;
  }

  public async put(key: string, value?: t.Json): Promise<t.IDbValue> {
    this.throwIfDisposed('put');
    return (await this.putMany([{ key, value }]))[0];
  }
  public async putMany(items: t.IDbKeyValue[]): Promise<t.IDbValue[]> {
    this.throwIfDisposed('putMany');
    await this.ensureTables(items.map(item => item.key));
    const now = time.now.timestamp;
    await Promise.all(
      items
        .map(item => ({ key: PgDoc.parseKey(item.key), value: item.value }))
        .map(item => {
          const data = { data: item.value };
          return `
            INSERT INTO "${item.key.table}" ("path", "data", "createdAt", "modifiedAt")
              VALUES ('${item.key.path}', '${JSON.stringify(data)}', ${now}, ${now})
              ON CONFLICT (path)
              DO
                UPDATE
                SET "data" = EXCLUDED.data, "modifiedAt" = ${now};
          `;
        })
        .map(sql => this.pool.query(sql)),
    );
    return this.getMany(items.map(item => item.key));
  }

  public async delete(key: string): Promise<t.IDbValue> {
    this.throwIfDisposed('delete');
    return (await this.deleteMany([key]))[0];
  }
  public async deleteMany(keys: string[]): Promise<t.IDbValue[]> {
    this.throwIfDisposed('deleteMany');
    keys = R.uniq(keys);
    await this.ensureTables(keys);

    await Promise.all(
      keys
        .map(key => PgDoc.parseKey(key))
        .map(async key => {
          const sql = `DELETE FROM "${key.table}" WHERE path = '${key.path}'`;
          const res = await this.pool.query(sql);
          const { rows } = res;
          return { rows, path: key.toString() };
        }),
    );

    return keys.map(key => {
      const res: t.IDbValue = {
        value: undefined,
        props: { key, exists: false, createdAt: -1, modifiedAt: -1 },
      };
      return res;
    });
  }

  public async find(query: string | t.IDbQuery): Promise<t.IDbFindResult> {
    this.throwIfDisposed('find');
    const pattern = (typeof query === 'object' ? query.pattern : query) || '';
    const deep = typeof query === 'object' ? defaultValue(query.deep, true) : true;
    if (!pattern) {
      throw new Error(`A query pattern must contain at least a root TABLE name.`);
    }

    // Prepare search SQL statement.
    const key = PgDoc.parseKey(pattern, { requirePath: false });
    let sql = `SELECT * FROM "${key.table}"`;
    sql = key.path ? `${sql} WHERE path ~ '^${key.path}'` : sql;
    sql = `${sql};`;

    // Query the database.
    const res = await this.pool.query(sql);
    const list = res.rows
      .filter(row => {
        // NB: This may be able to be done in a more advanced regex in SQL above.
        return deep
          ? true // Deep: All child paths accepted.
          : !row.path.substring(key.path.length + 1).includes('/'); // Not deep: ensure this is not deeper than the given path.
      })
      .map(row => {
        const value = row && typeof row.data === 'object' ? (row.data as any).data : undefined;
        const { createdAt, modifiedAt } = PgDoc.toTimestamps(row);
        const res: t.IDbValue = {
          value,
          props: {
            key: PgDoc.join(key.table, row.path),
            exists: Boolean(value),
            createdAt,
            modifiedAt,
          },
        };
        return res;
      });

    // Return data structure.
    let keys: string[] | undefined;
    let map: t.IDbFindResult['map'] | undefined;
    return {
      list,
      get keys() {
        if (!keys) {
          keys = list.map(item => item.props.key);
        }
        return keys;
      },
      get map() {
        if (!map) {
          map = list.reduce((acc, next) => ({ ...acc, [next.props.key]: next.value }), {});
        }
        return map;
      },
    };
  }

  public toString() {
    const { host, database } = this._args.db;
    return `[PgDoc:${host}/${database}]`;
  }

  /**
   * [Helpers]
   */

  private async ensureTables(keys: string[]) {
    const tables = R.uniq(keys.map(key => PgDoc.parseKey(key)).map(item => item.table));
    await Promise.all(tables.map(table => this.ensureTable(table)));
  }

  private async ensureTable(table: string) {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS "public"."${table}" (
        "id" serial,
        "path" text NOT NULL,
        "createdAt" bigint NOT NULL,
        "modifiedAt" bigint NOT NULL,
        "data" jsonb,
        PRIMARY KEY ("id"),
        UNIQUE ("path")
      );
    `);
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because the ${this.toString()} has been disposed.`);
    }
  }
}
