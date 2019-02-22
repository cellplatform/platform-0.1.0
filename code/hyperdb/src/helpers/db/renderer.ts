import * as t from './types';
import { IpcClient } from '@platform/electron/lib/types';

/**
 * Initialize a new instance of a HyperDb
 */
// export async function create<D extends object = any>(args: { storage: string; dbKey?: string }) {
//
// }

export class Db<D extends object = any> {
  /**
   * [Static]
   */
  public static create<D extends object = any>(args: {
    ipc: IpcClient;
    storage: string;
    dbKey?: string;
  }) {
    // const reduce = (a: any, b: any) => a;
    // return new Promise<Db<D>>((resolve, reject) => {
    //   const { storage, dbKey } = args;
    //   const options = { valueEncoding: 'utf-8', reduce };
    //   const db = args.dbKey ? hyperdb(storage, dbKey, options) : hyperdb(storage, options);
    //   db.on('ready', () => {
    //     resolve(new Db<D>(db));
    //   });
    // });
  }

  /**
   * [Constructor]
   */
  private constructor(args: { ipc: IpcClient }) {
    // this._.db = hyperdb;
  }
}
