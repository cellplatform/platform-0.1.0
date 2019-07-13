import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { pg } from '../common';

export type IPgArgs = { db: pg.PoolConfig };

export class Pg {
  /**
   * [Static]
   */
  public static create(args: IPgArgs) {
    const db = new Pg(args);
    return db;
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IPgArgs) {
    this._args = args;
    this.pool = new pg.Pool(args.db);
  }

  public dispose() {
    if (!this.isDisposed) {
      this._isDisposed = true;
      this._dispose$.next();
      this._dispose$.complete();
      this.pool.end();
    }
  }
  public get isDisposed() {
    return this._isDisposed || this._dispose$.isStopped;
  }

  /**
   * [Fields]
   */
  private _isDisposed = false;
  private readonly _args: IPgArgs;
  public readonly pool: pg.Pool;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  /**
   * [Properties]
   */
  public get info() {
    const { user, host, database } = this._args.db;
    return { user, host, database };
  }

  /**
   * [Methods]
   */
  public query(query: string | pg.QueryConfig, values?: any[]): Promise<pg.QueryResult> {
    return this.pool.query(query, values);
  }

  public async dropTable(...tables: string[]) {
    const drop = (table: string) => this.pool.query(`DROP TABLE IF EXISTS "${table}"`);
    await Promise.all(tables.map(table => drop(table)));
  }

  public toString() {
    const { host, database } = this._args.db;
    return `[pg:${host}/${database}]`;
  }
}
