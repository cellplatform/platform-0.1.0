import { Subject } from 'rxjs';

import { GLOBAL } from '../constants';
import { IpcClient } from '../ipc/Client';
import { Store } from './Client';
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
  if (global[GLOBAL.STORE_CLIENT]) {
    return global[GLOBAL.STORE_CLIENT] as t.IStoreClient<T>;
  }
  const ipc = args.ipc as IpcClient<t.StoreEvents>;
  const change$ = new Subject<t.IStoreChange>();

  const getValues: t.GetStoreValues<T> = async keys => {
    try {
      // Fire the event requesting data.
      const payload = { keys: keys as string[] };
      const res = await ipc.send<
        t.IStoreGetValuesEvent,
        t.IStoreGetValuesResponse
      >('@platform/STORE/get', payload, { target: 0 }).promise;

      // Extract details from the response from MAIN.
      const main = res.resultFrom('MAIN');
      const data = main ? main.data : undefined;

      // Ensure main responded with data.
      if (data && (!data.ok || data.error)) {
        const message =
          data.error || `Failed while getting store values for [${keys}].`;
        throw new Error(message);
      }

      // Finish up.
      return !data || !data.exists ? {} : data.body;
    } catch (error) {
      let msg = `Failed while getting store values for [${keys}]. `;
      msg += error.message;
      throw new Error(msg);
    }
  };

  const setValues: t.SetStoreValues<T> = async (
    values: t.IStoreKeyValue[],
    action: t.StoreSetAction,
  ) => {
    const keys = values.map(({ key }) => key);
    try {
      // Fire the event requesting data.
      const payload: t.IStoreSetValuesEvent['payload'] = {
        values,
        action,
      };
      const res = await ipc.send<
        t.IStoreSetValuesEvent,
        t.IStoreSetValuesResponse<T>
      >('@platform/STORE/set', payload, { target: 0 }).promise;

      // Wait for the response.
      const result = res.resultFrom('MAIN');
      if (!result || !result.data) {
        const message = `Failed while setting values for [${keys}]. No response from [main].`;
        throw new Error(message);
      }

      // Finish up.
      return result.data;
    } catch (error) {
      let msg = `Failed while settings store values for [${keys}]. `;
      msg += error.message;
      throw new Error(msg);
    }
  };

  const getKeys: t.GetStoreKeys<T> = async () => {
    const res = await ipc.send<t.IStoreGetKeysEvent, Array<keyof T>>(
      '@platform/STORE/keys',
      {},
      { target: 0 },
    ).promise;
    const main = res.resultFrom('MAIN');
    return main && main.data ? main.data : [];
  };

  const openInEditor: t.OpenStoreInEditor = () => {
    ipc.send<t.IOpenStoreFileInEditorEvent>('@platform/STORE/openInEditor', {});
  };

  ipc
    .on<t.IStoreChangeEvent>('@platform/STORE/change')
    .subscribe(e => change$.next(e.payload));

  /**
   * Create the client.
   */
  const client = new Store<T>({
    getKeys,
    getValues,
    setValues,
    change$,
    openInEditor,
  });

  // Finish up.
  global[GLOBAL.STORE_CLIENT] = client;
  return client;
}
