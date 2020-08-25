export * from '@platform/state.types/lib/types.Store';

/**
 * Export entry API as constrained interface.
 */
import * as t from '@platform/state.types/lib/types.Store';
import { Store as StoreClass } from './Store';
export const Store = StoreClass as t.Store;
