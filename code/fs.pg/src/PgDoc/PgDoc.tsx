import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { R, t, pg } from '../common';

export type IPgDocArgs = {
  db: pg.PoolConfig;
};

type IRow = { id: number; path: string; data: t.Json };

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
   * [DB_Methods]
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
          const query = `SELECT * FROM "${key.table}" WHERE path = '${key.path}'`;
          const res = await this.pool.query(query);
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
      const res: t.IDbValue = { value, props: { key, exists: Boolean(value) } };
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
    await Promise.all(
      items
        .map(item => ({ key: PgDoc.parseKey(item.key), value: item.value }))
        .map(item => {
          const data = { data: item.value };
          return `
            INSERT INTO "${item.key.table}" (path, data)
              VALUES ('${item.key.path}', '${JSON.stringify(data)}')
              ON CONFLICT (path)
              DO
                UPDATE
                SET data = EXCLUDED.data;
          `;
        })
        .map(query => this.pool.query(query)),
    );
    return items.map(item => {
      const { key, value } = item;
      const res: t.IDbValue = { value, props: { key, exists: Boolean(value) } };
      return res;
    });
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
          const query = `DELETE FROM "${key.table}" WHERE path = '${key.path}'`;
          const res = await this.pool.query(query);
          const { rows } = res;
          return { rows, path: key.toString() };
        }),
    );

    return keys.map(key => {
      const res: t.IDbValue = { value: undefined, props: { key, exists: false } };
      return res;
    });
  }

  public async find(query: string | t.IDbQuery): Promise<t.IDbFindResult> {
    this.throwIfDisposed('find');
    // const dir = this.dir;
    // query = typeof query === 'string' ? { pattern: query } : query;
    // const res = await this.invoke<t.IDbIpcFindResponse>({
    //   type: 'DB/find',
    //   payload: { dir, query },
    // });
    // return res.result;
  }

  /**
   * Methods
   */

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
        "data" jsonb,
        PRIMARY KEY ("id"),
        UNIQUE ("path")
      );
    `);
  }

  public static parseKey(key: string) {
    key = (key || '').trim().replace(/^\/*/, '');
    const index = key.indexOf('/');
    if (index < 0) {
      throw new Error(`The key does not have a path like structure (eg "TABLE/foo/bar"): ${key}`);
    }
    const table = key.substring(0, index).trim();
    const path = key
      .substr(table.length)
      .replace(/\/*$/, '')
      .trim();

    if (!table) {
      throw new Error(`The key path does not have a root table name: ${key}`);
    }

    if (!path) {
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
      toString() {
        return key;
      },
    };
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because the ${this.toString()} has been disposed.`);
    }
  }
}
