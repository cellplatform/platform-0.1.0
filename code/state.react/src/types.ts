import { IStoreEvent, IStoreContext } from '@platform/state';

export * from '@platform/state/lib/types';

/**
 * The context object that is passed down through the React hierarchy.
 */
export type IStateContext<P = {}> = P & {
  getStore<M extends {}, E extends IStoreEvent>(): IStoreContext<M, E>;
};
