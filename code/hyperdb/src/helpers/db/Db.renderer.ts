import * as t from './types';
import { IpcClient } from '@platform/electron/lib/types';

type IConstructorArgs = {
  ipc: IpcClient;
  storage: string;
  dbKey?: string;
  props?: t.IDbProps;
};

const TARGET_MAIN = { target: 0 };

/**
 * The [renderer] client to a `Db` that runs on the [main] prcoess.
 *
 */
export class Db<D extends object = any> {
  /**
   * [Static]
   */
  public static async create<D extends object = any>(args: IConstructorArgs) {
    const db = new Db<D>(args); // as t.IDb<D>;
    await db.ready;
    return db;
  }

  /**
   * [Constructor]
   */
  private constructor(args: IConstructorArgs) {
    this._ipc = args.ipc;
    this._storage = args.storage;
    this._dbKey = args.dbKey;
    this.ready = this.syncState();
  }

  /**
   * [Fields]
   */
  public ready: Promise<any>;
  private _ipc: t.DbIpcClient;
  private _storage: string;
  private _dbKey: string | undefined;
  private _props: t.IDbProps;

  /**
   * [Properties]
   */
  public get key() {
    return this.getProp('key');
  }

  public get discoveryKey() {
    return this.getProp('discoveryKey');
  }

  public get localKey() {
    return this.getProp('localKey');
  }

  public get watching() {
    return this.getProp('watching');
  }

  public get isDisposed() {
    return this.getProp('isDisposed');
  }

  /**
   * [Internal]
   */
  private async syncState() {
    type E = t.IDbIpcGetStateEvent;
    type R = t.IDbIpcGetStateResponse;
    const payload: E['payload'] = {
      storage: this._storage,
      dbKey: this._dbKey,
    };
    const res = await this._ipc.send<E, R>('HYPERDB/getState', payload, TARGET_MAIN).promise;
    const data = res.dataFrom('MAIN');
    if (data) {
      this._props = data.props;
    }
  }

  private getProp(key: keyof t.IDbProps) {
    if (!this._props) {
      throw new Error(`Db client has not been synced.`);
    }
    return this._props[key];
  }
}
