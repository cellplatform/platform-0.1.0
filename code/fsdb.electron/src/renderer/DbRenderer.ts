import { Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';
import { t } from './common';

export type IDbRendererArgs = {
  conn: string;
  ipc: t.DbIpc;
};

/**
 * Proxy to a file-system DB on the main process.
 */
export class DbRenderer implements t.IDb {
  /**
   * [Static]
   */
  public static create(args: IDbRendererArgs) {
    return new DbRenderer(args);
  }

  /**
   * [Lifecycle]
   */

  private constructor(args: IDbRendererArgs) {
    const { conn, ipc } = args;
    this.conn = conn;
    this.ipc = ipc;

    ipc
      .on<t.IDbIpcDbFiredEvent>('DB/fired')
      .pipe(
        takeUntil(this.dispose$),
        filter(e => e.payload.conn === conn),
      )
      .subscribe(e => this._events$.next(e.payload.event));
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  public readonly conn: string;
  private readonly ipc: t.DbIpc;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.DbEvent>();
  public readonly events$ = this._events$.pipe(share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */
  public async get(key: string): Promise<t.IDbValue> {
    return (await this.getMany([key]))[0];
  }
  public async getMany(keys: string[]): Promise<t.IDbValue[]> {
    const conn = this.conn;
    const res = await this.invoke<t.IDbIpcGetResponse>({
      type: 'DB/get',
      payload: { conn, keys },
    });
    return res.values;
  }
  public async getValue<T extends t.Json | undefined>(key: string): Promise<T> {
    const res = await this.get(key);
    return (res ? res.value : undefined) as T;
  }

  public async put(key: string, value?: t.Json): Promise<t.IDbValue> {
    return (await this.putMany([{ key, value }]))[0];
  }
  public async putMany(items: t.IDbKeyValue[]): Promise<t.IDbValue[]> {
    const conn = this.conn;
    const res = await this.invoke<t.IDbIpcPutResponse>({
      type: 'DB/put',
      payload: { conn, items },
    });
    return res.values;
  }

  public async delete(key: string): Promise<t.IDbValue> {
    return (await this.deleteMany([key]))[0];
  }
  public async deleteMany(keys: string[]): Promise<t.IDbValue[]> {
    const conn = this.conn;
    const res = await this.invoke<t.IDbIpcDeleteResponse>({
      type: 'DB/delete',
      payload: { conn, keys },
    });
    return res.values;
  }

  public async find(query: string | t.IDbQuery): Promise<t.IDbFindResult> {
    const conn = this.conn;
    query = typeof query === 'string' ? { path: query } : query;
    const res = await this.invoke<t.IDbIpcFindResponse>({
      type: 'DB/find',
      payload: { conn, query },
    });
    return res.result;
  }

  /**
   * [Helpers]
   */

  private async invoke<T>(e: t.DbIpcEvent) {
    const res = await this.ipc.send(e.type, e.payload, { target: this.ipc.MAIN }).promise;
    return res.dataFrom('MAIN') as T;
  }
}
