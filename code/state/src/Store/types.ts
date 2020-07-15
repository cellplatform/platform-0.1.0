import { Observable, Subject } from 'rxjs';

type O = Record<string, unknown>;

export type IStoreArgs<M extends O> = {
  initial: M;
  event$?: Subject<any>;
};

export type Store = {
  /**
   * Creates a new state-machine.
   */
  create<M extends O, E extends IStoreEvent>(args: IStoreArgs<M>): IStore<M, E>;
};

/**
 * An observable state machine.
 */
export type IStore<M extends O, E extends IStoreEvent> = {
  state: M;
  isDisposed: boolean;

  dispose$: Observable<void>;
  changing$: Observable<IStateChanging>;
  changed$: Observable<IStateChange<M, E>>;
  event$: Observable<IDispatch<M, E, E>>;

  dispose(): void;
  dispatch(event: E): IStore<M, E>;
  on<E2 extends E>(type: E2['type']): Observable<IDispatch<M, E2, E>>;
};

/**
 * A representation of store containing
 * the current state and ability to dispatch change requests.
 */
export type IStoreContext<M extends O = any, E extends IStoreEvent = IStoreEvent> = {
  state: M;
  changed$: Observable<IStateChange<M, E>>;
  dispatch(event: E): IStoreContext<M, E>;
};

/**
 * Basic shape of an event fired through the state-machine.
 */
export type IStoreEvent = {
  type: string;
  payload: O;
};

/**
 * A wrapper of an [IStoreEvent] that is dispatched through
 * the store's `events$` observable.
 */
export type IDispatch<
  M extends O = any,
  E extends IStoreEvent = IStoreEvent,
  D extends IStoreEvent = IStoreEvent
> = {
  type: E['type'];
  payload: E['payload'];
  state: M;
  dispatch(event: D): IDispatch<M, E>;
  change(next: M | ((draft: M) => any)): IDispatch<M, E>;
};

/**
 * A notification of a change to a store's state-tree.
 */
export type IStateChange<M extends O = any, E extends IStoreEvent = IStoreEvent> = {
  type: E['type'];
  event: E;
  from: M;
  to: M;
};

/**
 * A notification that a change is about to be made to the store's state-tree.
 */
export type IStateChanging<M extends O = any, E extends IStoreEvent = IStoreEvent> = {
  change: IStateChange<M, E>;
  isCancelled: boolean;
  cancel(): void;
};
