import * as t from './types';
import { IpcClient } from '@platform/electron/lib/types';

export type IConstructorArgs = {
  ipc: IpcClient;
  storage: string;
  dbKey?: string;
};

/**
 * The [renderer] client to a `Db` that runs on the [main] prcoess.
 *
 */
export class Db<D extends object = any> {
  /**
   * [Static]
   */
  public static create<D extends object = any>(args: IConstructorArgs) {
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
  private constructor(args: IConstructorArgs) {
    // this._.db = hyperdb;
  }
}
