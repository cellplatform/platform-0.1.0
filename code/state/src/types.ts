import { Observable } from 'rxjs';

/**
 * An observable state machine.
 */
export type IStore<M extends {}, E extends IStoreEvent> = {
  state: M;
  isDisposed: boolean;

  dispose$: Observable<{}>;
  changing$: Observable<IStateChanging>;
  changed$: Observable<IStateChange>;
  events$: Observable<IStoreEvent>;

  dispose(): void;
  dispatch(event: E): IStore<M, E>;
  on<T extends E>(type: T['type']): Observable<IDispatch<M, T, E>>;
};

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
  type: E['type'];
  event: E;
  from: M;
  to: M;
};

/**
 * A notification that a change is about to be made to the store's state-tree.
 */
export type IStateChanging<M extends {} = {}, E extends IStoreEvent = IStoreEvent> = {
  change: IStateChange<M, E>;
  isCancelled: boolean;
  cancel(): void;
};
