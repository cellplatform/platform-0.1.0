import * as t from './types';
import { Client } from './Client';
import { IpcClient } from '../ipc/Client';
import { app } from 'electron';
import { fs } from '@platform/fs';

export * from './types';

type Refs = { client?: t.IStoreClient };
const refs: Refs = {};

/**
 * Initializes a store [renderer] client.
 */
export function init<T extends t.StoreJson>(args: {
  ipc: IpcClient;
  dir?: string;
  name?: string;
}): t.IMainStoreClient<T> {
  type IClientMain = t.IMainStoreClient<T>;

  /**
   * HACK:  Ensure multiple clients are not initialized on HMR (hot-module-reloads).
   *        This will only happen during development.
   */
  if (refs.client) {
    return refs.client as IClientMain;
  }
  const ipc = args.ipc as IpcClient<t.StoreEvents>;

  const getValues: t.GetStoreValues<T> = async keys => {
    return { foo: 'MAIN' };
  };

  // Create the client.
  const client = (new Client<T>({ getValues }) as unknown) as IClientMain;

  // Store the path to the settings file.
  const name = (args.name || 'settings').replace(/\.json$/, '') + '.json';
  const dir = fs.resolve(args.dir || app.getPath('userData'));
  const path = fs.join(dir, name);
  client.path = path;

  /**
   * Handle GET value requests.
   */
  ipc.handle<t.IStoreGetValuesEvent>('@platform/STORE/get', async e => {
    const res: t.IStoreGetResponse = { exists: true, json: {} };
    const file = await fs.file.loadAndParse(path);
    if (!file) {
      return { ...res, exists: false };
    }

    console.log('TODO - read value', e);
    return res;
  });

  // Finish up.
  refs.client = client;
  return client;
}
