import { IpcClient } from '../ipc/Client';
import { Client } from './Client';
import * as t from './types';
import { GLOBAL } from '../common/constants';

const global: any = window;

export * from './types';

/**
 * Initializes a store [renderer] client.
 */
export function init<T extends t.StoreJson>(args: {
  ipc: IpcClient;
}): t.IStoreClient<T> {
  /**
   * HACK:  Ensure multiple clients are not initialized on HMR (hot-module-reloads).
   *        This will only happen during development.
   */
  if (global[GLOBAL.STORE]) {
    return global[GLOBAL.STORE] as t.IStoreClient<T>;
  }
  const ipc = args.ipc as IpcClient<t.StoreEvents>;

  const getValues: t.GetStoreValues<T> = async keys => {
    console.log('GET', keys);
    return { foo: 123 };
  };

  /**
   * Create the client.
   */
  const client = new Client<T>({ getValues });

  // Finish up.
  global[GLOBAL.STORE] = client;
  return client;
}
