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

  /**
   * Read values from storage.
   */
  const getValues: t.GetStoreValues<T> = async keys => {
    const res: t.IStoreGetValuesResponse = {
      ok: true,
      exists: true,
      version: -1,
      body: {},
    };
    try {
      const { exists, data } = await getFile();
      if (!exists) {
        return { ...res, exists };
      }

      // Read data into response.
      res.version = typeof data.version === 'number' ? data.version : -1;
      keys
        .map(key => key.toString())
        .forEach(key => (res.body[key] = data.body[key]));

      // Finish up.
      res.ok = true;
      return res;
    } catch (error) {
      // Failed
      res.ok = false;
      res.error = error.message;
      return res;
    }
  };

  /**
   * Save values to storage.
   */
  const setValues: t.SetStoreValues<T> = async (values: t.IStoreKeyValue[]) => {
    const res: t.IStoreSetValuesResponse = { ok: true };

    try {
      // Ensure the file exists.
      const { exists, data } = await getFile();
      if (!exists) {
        await fs.ensureDir(dir);
      }

      // Update values.
      // const { values = [] } = e.payload;
      values.forEach(({ key, value }) => (data.body[key.toString()] = value));

      // Increment write versino.
      // NOTE:
      //    In the future we may want to check an incoming version prior to write
      //    and fail if the version has changed since the request was issued.
      data.version = typeof data.version === 'number' ? data.version + 1 : 0;

      // Perform the save operation.
      await fs.file.stringifyAndSave(path, data);

      // Finish up.
      res.ok = true;
      return res;
    } catch (error) {
      // Failed
      res.ok = false;
      res.error = error.message;
      return res;
    }
  };

  // Create the client.
  const client = (new Client<T>({
    getValues,
    setValues,
  }) as unknown) as IClientMain;

  // Store the path to the settings file.
  const name = (args.name || 'settings').replace(/\.json$/, '') + '.json';
  const dir = fs.resolve(args.dir || app.getPath('userData'));
  const path = fs.join(dir, name);
  client.path = path;

  const getFile = async () => {
    const file = await fs.file.loadAndParse<t.IStoreFile>(path);
    const exists = Boolean(file);
    const data: t.IStoreFile = exists ? file : { version: -1, body: {} };
    return { exists, data };
  };

  /**
   * Handle GET value requests.
   */
  ipc.handle<t.IStoreGetValuesEvent>('@platform/STORE/get', e =>
    getValues(e.payload.keys),
  );

  /**
   * Handle SET value requests.
   */
  ipc.handle<t.IStoreSetValuesEvent>('@platform/STORE/set', e =>
    setValues(e.payload.values),
  );

  // Finish up.
  refs.client = client;
  return client;
}
