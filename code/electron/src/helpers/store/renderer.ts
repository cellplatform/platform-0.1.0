import { IStoreClient, IStoreObject, StoreObjectValue } from './types';
import { Client } from './Client';

const global: any = window;
const KEY = '__SYS/PLATFORM/STORE_CLIENT__';

export * from './types';

/**
 * Initializes a store [renderer] client.
 */
export function init<T extends IStoreObject>(args: {} = {}): IStoreClient<T> {
  /**
   * HACK:  Ensure multiple clients are not initialized on HMR (hot-module-reloads).
   *        This will only happen during development.
   */
  if (global[KEY]) {
    return global[KEY] as IStoreClient<T>;
  }

  /**
   * Create the client.
   */
  const client = new Client<T>();

  // Finish up.
  global[KEY] = client;
  return client;
}
