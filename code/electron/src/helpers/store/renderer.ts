import { GLOBAL } from '../constants';
import { IpcClient } from '../ipc/Client';
import { Client } from './Client';
import * as t from './types';

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
  const global: any = window;
  if (global[GLOBAL.STORE_REF]) {
    return global[GLOBAL.STORE_REF] as t.IStoreClient<T>;
  }
  const ipc = args.ipc as IpcClient<t.StoreEvents>;

  const getValues: t.GetStoreValues<T> = async keys => {
    // Fire the event requesting data.
    const payload = { keys: keys as string[] };
    const res = ipc.send<t.IStoreGetValuesEvent, t.IStoreGetValuesResponse>(
      '@platform/STORE/get',
      payload,
    );

    try {
      await res.results$.toPromise();
      const result = res.results.find(m => m.sender.process === 'MAIN');
      const data = result ? result.data : undefined;
      if (data && (!data.ok || data.error)) {
        const message =
          data.error || `Failed while getting store values for keys [${keys}].`;
        throw new Error(message);
      }
      if (!data || !data.exists) {
        return {};
      }
      return data.body;
    } catch (error) {
      throw error;
    }
  };

  const setValues: t.SetStoreValues<T> = async (
    values: t.IStoreKeyValue[],
    action: t.StoreSetAction,
  ) => {
    // Fire the event requesting data.
    const payload: t.IStoreSetValuesEvent['payload'] = {
      values,
      action,
    };
    const res = ipc.send<t.IStoreSetValuesEvent, t.IStoreSetValuesResponse<T>>(
      '@platform/STORE/set',
      payload,
    );

    // Wait for the response.
    await res.results$.toPromise();
    const result = res.results.find(m => m.sender.process === 'MAIN');
    if (!result || !result.data) {
      const keys = values.map(({ key }) => key);
      const message = `Failed while setting values for [${keys}]. No response from [main].`;
      throw new Error(message);
    }

    // Finish up.
    return result.data;
  };

  const getKeys: t.GetStoreKeys<T> = async () => {
    const res = await ipc.send<t.IStoreGetKeysEvent, Array<keyof T>>(
      '@platform/STORE/keys',
      {},
    );
    await res.results$.toPromise();
    const result = res.results.find(m => m.sender.process === 'MAIN');
    return result && result.data ? result.data : [];
  };

  /**
   * Create the client.
   */
  const client = new Client<T>({ getKeys, getValues, setValues });

  // Finish up.
  global[GLOBAL.STORE_REF] = client;
  return client;
}
