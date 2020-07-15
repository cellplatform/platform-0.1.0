export * from './types';

/**
 * Export entry API as constrained interface.
 */
import * as t from './types';
import { Store as StoreClass } from './Store';
export const Store = StoreClass as t.Store;
