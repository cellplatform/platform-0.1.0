import { IStoreEvent, IStoreContext } from '@platform/state/lib/Store/types';

export * from '@platform/state/lib/types';

/**
 * The context object that is passed down through the React hierarchy.
 */
export type IStateContext<P = Record<string, unknown>> = P & {
  getStore<M extends Record<string, unknown>, E extends IStoreEvent>(): IStoreContext<M, E>;
};
