import { fs } from '@platform/fs';
import { app, shell } from 'electron';
import { Subject } from 'rxjs';

import { IpcClient } from '../ipc/Client';
import { Store } from './Client';
import * as t from './types';
import { is } from '../is/main';

export * from './types';

type Refs = { client?: t.ISettingsClient };
const refs: Refs = {};

/**
 * Initializes a store [renderer] client.
 */
export function init<T extends t.SettingsJson>(args: {
  ipc: IpcClient;
  dir?: string;
  name?: string;
}): t.IMainSettingsClient<T> {
  type IClientMain = t.IMainSettingsClient<T>;

  /**
   * HACK:  Ensure multiple clients are not initialized on HMR (hot-module-reloads).
   *        This will only happen during development.
   */
  if (refs.client) {
    return refs.client as IClientMain;
  }
  const ipc = args.ipc as IpcClient<t.SettingsEvent>;
  const change$ = new Subject<t.ISettingsChange>();

  /**
   * Read values from storage.
   */
  const getValuesHandler = async (keys: Array<keyof T>) => {
    const res: t.ISettingsGetValuesResponse = {
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
      if (keys.length > 0) {
        keys.map(key => key.toString()).forEach(key => (res.body[key] = data.body[key]));
      } else {
        // NB: When no keys specified the entire data-set is being requested.
        res.body = data.body;
      }

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

  const getValues: t.GetSettingsValues<T> = async keys => {
    const res = await getValuesHandler(keys);
    return res.body || {};
  };
  /**
   * Save values to storage.
   */
  const setValues: t.SetSettingsValues<T> = async (
    values: t.ISettingsKeyValue[],
    action: t.SettingsSetAction,
  ) => {
    const res: t.ISettingsSetValuesResponse = { ok: true };
    const keys = values.map(({ key }) => key.toString());

    try {
      // Ensure the file exists.
      const { exists, data } = await getFile();
      if (!exists) {
        await fs.ensureDir(dir);
      }

      // Update values.
      const body = data.body;
      switch (action) {
        case 'UPDATE':
          values.forEach(({ key, value }) => (body[key.toString()] = value));
          break;

        case 'DELETE':
          values.forEach(({ key }) => {
            delete body[key.toString()];
          });

          break;

        default:
          throw new Error(`Action '${action}' not supported.`);
      }

      // Increment the file's version number.
      // NOTE:
      //    In the future we may want to check an incoming version prior to write
      //    and fail if the version has changed since the request was issued.
      data.version = typeof data.version === 'number' ? data.version + 1 : 0;

      // Perform the save operation.
      await fs.file.stringifyAndSave(path, data);

      // Alert listeners.
      const change: t.ISettingsChange = {
        action,
        keys,
        values: values.reduce((acc, next) => ({ ...acc, [next.key]: next.value }), {}),
      };
      ipc.send<t.ISettingsChangeEvent>('@platform/STORE/change', change);
      change$.next(change);

      // Finish up.
      res.ok = true;
      return res;
    } catch (error) {
      // Failed.
      res.ok = false;
      res.error = error.message;
      return res;
    }
  };

  const getKeys: t.GetSettingsKeys<T> = async () => {
    const file = await getFile();
    return file.exists ? Object.keys(file.data.body) : [];
  };

  const openInEditor: t.OpenSettingsInEditor = () => {
    shell.openItem(path);
  };

  // Create the client.
  const client = (new Store<T>({
    change$,
    getValues,
    setValues,
    getKeys,
    openInEditor,
  }) as unknown) as IClientMain;

  // Store the path to the settings file.
  const name = (args.name || 'settings').replace(/\.json$/, '') + '.json';
  const dir =
    args.dir || is.prod
      ? fs.resolve(args.dir || app.getPath('userData'))
      : fs.resolve('./.dev/store');
  const path = fs.join(dir, name);
  client.path = path;

  const getFile = async () => {
    const file = await fs.file.loadAndParse<t.ISettingsFile>(path);
    const exists = Boolean(file);
    const data: t.ISettingsFile = exists ? file : { version: -1, body: {} };
    return { exists, data };
  };

  /**
   * Handle GET keys requests.
   */
  ipc.handle<t.ISettingsGetKeysEvent>('@platform/STORE/keys', e => getKeys());

  /**
   * Handle GET value requests.
   */
  ipc.handle<t.ISettingsGetValuesEvent>('@platform/STORE/get', e =>
    getValuesHandler(e.payload.keys),
  );

  /**
   * Handle SET value requests.
   */
  ipc.handle<t.ISettingsSetValuesEvent>('@platform/STORE/set', e =>
    setValues(e.payload.values, e.payload.action),
  );

  /**
   * Handle `open in editor` requests.
   */
  ipc.handle<t.IOpenSettingsFileInEditorEvent>('@platform/STORE/openInEditor', async e =>
    openInEditor(),
  );

  // Finish up.
  refs.client = client;
  return client;
}
