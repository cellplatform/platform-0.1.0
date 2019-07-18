import { Subject } from 'rxjs';

import { GLOBAL } from '../constants';
import { IpcClient } from '../ipc/Client';
import { SettingsClient } from './SettingsClient';
import * as t from './types';

export * from './types';

/**
 * Initializes a SettingsClient on the [renderer] process.
 */
export function init<T extends t.SettingsJson>(args: { ipc: IpcClient }): t.ISettingsClient<T> {
  /**
   * HACK:  Ensure multiple clients are not initialized on HMR (hot-module-reloads).
   *        This will only happen during development.
   */
  const global: any = window;
  if (global[GLOBAL.SETTINGS_CLIENT]) {
    return global[GLOBAL.SETTINGS_CLIENT] as t.ISettingsClient<T>;
  }
  const ipc = args.ipc as IpcClient<t.SettingsEvent>;
  const change$ = new Subject<t.ISettingsChange>();

  const getValues: t.GetSettingsValues<T> = async keys => {
    try {
      // Fire the event requesting data.
      const payload = { keys: keys as string[] };
      const res = await ipc.send<t.ISettingsGetValuesEvent, t.ISettingsGetValuesResponse>(
        '@platform/SETTINGS/get',
        payload,
        { target: 0 },
      ).promise;

      // Extract details from the response from MAIN.
      const main = res.resultFrom('MAIN');
      const data = main ? main.data : undefined;

      // Ensure main responded with data.
      if (data && (!data.ok || data.error)) {
        const message = data.error || `Failed while getting settings values for [${keys}].`;
        throw new Error(message);
      }

      // Finish up.
      return !data || !data.exists ? {} : data.body;
    } catch (error) {
      let msg = `Failed while getting settings values for [${keys}]. `;
      msg += error.message;
      throw new Error(msg);
    }
  };

  const setValues: t.SetSettingsValues<T> = async (
    values: t.ISettingsKeyValue[],
    action: t.SettingsSetAction,
  ) => {
    const keys = values.map(({ key }) => key);
    try {
      // Fire the event requesting data.
      const payload: t.ISettingsSetValuesEvent['payload'] = {
        values,
        action,
      };
      const res = await ipc.send<t.ISettingsSetValuesEvent, t.ISettingsSetValuesResponse<T>>(
        '@platform/SETTINGS/set',
        payload,
        { target: 0 },
      ).promise;

      // Wait for the response.
      const result = res.resultFrom('MAIN');
      if (!result || !result.data) {
        const message = `Failed while setting values for [${keys}]. No response from [main].`;
        throw new Error(message);
      }

      // Finish up.
      return result.data;
    } catch (error) {
      let msg = `Failed while settings settings values for [${keys}]. `;
      msg += error.message;
      throw new Error(msg);
    }
  };

  const getKeys: t.GetSettingsKeys<T> = async () => {
    const res = await ipc.send<t.ISettingsGetKeysEvent, Array<keyof T>>(
      '@platform/SETTINGS/keys',
      {},
      { target: 0 },
    ).promise;
    const main = res.resultFrom('MAIN');
    return main && main.data ? main.data : [];
  };

  const openInEditor: t.OpenSettings = () => {
    ipc.send<t.ISettingsOpenEvent>('@platform/SETTINGS/open', { target: 'EDITOR' });
  };

  const openFolder: t.OpenSettings = () => {
    ipc.send<t.ISettingsOpenEvent>('@platform/SETTINGS/open', { target: 'FOLDER' });
  };

  ipc
    .on<t.ISettingsChangeEvent>('@platform/SETTINGS/change')
    .subscribe(e => change$.next(e.payload));

  /**
   * Create the client.
   */
  const client = new SettingsClient<T>({
    getKeys,
    getValues,
    setValues,
    change$,
    openInEditor,
    openFolder,
  });

  // Finish up.
  global[GLOBAL.SETTINGS_CLIENT] = client;
  return client;
}
