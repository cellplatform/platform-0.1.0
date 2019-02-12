import { IStoreClient, IStoreObject, StoreObjectValue } from './types';
import { Client } from './Client';

export * from './types';

type Refs = {
  client?: IStoreClient;
};
const refs: Refs = {};

/**
 * Initializes a store [renderer] client.
 */
export function init<T extends IStoreObject>(args: {} = {}): IStoreClient<T> {
  /**
   * HACK:  Ensure multiple clients are not initialized on HMR (hot-module-reloads).
   *        This will only happen during development.
   */
  if (refs.client) {
    return refs.client as IStoreClient<T>;
  }

  /**
   * Create the client.
   */
  const client = new Client<T>();

  // Finish up.
  refs.client = client;
  return client;
}
