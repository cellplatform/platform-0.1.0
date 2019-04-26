/**
 * Basic shape of an event fired through the state-machine.
 */
export type IStateEvent = {
  type: string;
  payload: object;
};

/**
 * A wrapper of an `IStateEvent` that is dispatched through
 * the [events$] observable.
 */
export type IDispatch<
  M extends {} = {},
  E extends IStateEvent = IStateEvent,
  SE extends IStateEvent = IStateEvent
> = {
  type: E['type'];
  payload: E['payload'];
  current: M;
  change(next: M): IDispatch<M, E>;
  dispatch(event: SE): IDispatch<M, E>;
};

/**
 * A notification of a change to the state tree.
 */
export type IStateChange<M extends {} = {}, E extends IStateEvent = IStateEvent> = {
  event: E;
  from: M;
  to: M;
};
