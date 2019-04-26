/**
 * Basic shape of an event fired through the state-machine.
 */
export type IStoreEvent = {
  type: string;
  payload: object;
};

/**
 * A wrapper of an [IStoreEvent] that is dispatched through
 * the store's `events$` observable.
 */
export type IDispatch<
  M extends {} = {},
  E extends IStoreEvent = IStoreEvent,
  SE extends IStoreEvent = IStoreEvent
> = {
  type: E['type'];
  payload: E['payload'];
  state: M;
  change(next: M): IDispatch<M, E>;
  dispatch(event: SE): IDispatch<M, E>;
};

/**
 * A notification of a change to a store's state-tree.
 */
export type IStateChange<M extends {} = {}, E extends IStoreEvent = IStoreEvent> = {
  event: E;
  from: M;
  to: M;
};
