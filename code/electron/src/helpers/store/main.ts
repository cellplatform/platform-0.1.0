import * as t from './types';
import { Client } from './Client';
import { IpcClient } from '../ipc/Client';

export * from './types';

type Refs = {
  client?: t.IStoreClient;
};
const refs: Refs = {};

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
  if (refs.client) {
    return refs.client as t.IStoreClient<T>;
  }
  const ipc = args.ipc as IpcClient<t.StoreEvents>;

  const getValues: t.GetStoreValues<T> = async keys => {
    return { foo: 'MAIN' };
  };

  /**
   * Create the client.
   */
  const client = new Client<T>({ getValues });

  /**
   * Handle GET value requests.
   */
  ipc.handle<t.StoreGetEvent>('.SYS/STORE/get', async e => {
    console.log('handle', e);
  });

  // Finish up.
  refs.client = client;
  return client;
}
