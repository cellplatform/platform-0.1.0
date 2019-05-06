import { IStoreEvent, IStoreContext } from '@platform/state';

export * from '@platform/state/lib/types';

/**
 * The context object that is passed down through the React hierarchy.
 */
export type IStateContext = {
  getStore<M extends {}, E extends IStoreEvent>(): IStoreContext<M, E>;
};
