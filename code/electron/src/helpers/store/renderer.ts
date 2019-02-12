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
    console.log('GET', keys);
    const res = ipc.send<t.IStoreGetValuesEvent, t.IStoreGetResponse>(
      '@platform/STORE/get',
      {
        keys: keys as string[],
      },
    );

    // const results = await res.results

    res.results$.subscribe({
      complete: () => {
        const result = res.results.find(m => m.sender.process === 'MAIN');
        const data = result ? result.data : undefined;
        if (data) {
          console.log('data.exists', data.exists);
        }
        console.log('result', result);
        console.log('data', data);
      },
      error: err => {
        throw err;
      },
    });

    console.log('res', res);
    return { foo: 123 };
  };

  /**
   * Create the client.
   */
  const client = new Client<T>({ getValues });

  // Finish up.
  global[GLOBAL.STORE_REF] = client;
  return client;
}
