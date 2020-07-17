import { Observable } from 'rxjs';
import { Event } from '@platform/types';

type O = Record<string, unknown>;

export type StateObject = {
  create<T extends O, E extends Event<any> = any>(initial: T): IStateObjectWrite<T, E>;
  readonly<T extends O, E extends Event<any> = any>(
    obj: IStateObjectWrite<T, E> | IStateObject<T, E>,
  ): IStateObject<T, E>;
};

/**
 * Read-only.
 */
export type IStateObject<T extends O, E extends Event<any> = any> = IStateObjectRead<T, E>;
export type IStateObjectRead<T extends O, E extends Event<any> = any> = {
  readonly original: T;
  readonly state: T;
  readonly event$: Observable<StateObjectEvent>;
  readonly changing$: Observable<IStateObjectChanging<T>>;
  readonly changed$: Observable<IStateObjectChanged<T, E>>;
  readonly cancelled$: Observable<IStateObjectCancelled<T>>;
  readonly dispatch$: Observable<E>;
  dispatch(event: E): void;
  dispatched(action: E['type'], takeUntil$?: Observable<any>): Observable<E['payload']>;
  changed(action: E['type'], takeUntil$?: Observable<any>): Observable<IStateObjectChanged<T, E>>;
};

/**
 * Writeable.
 */
export type IStateObjectWrite<T extends O, E extends Event<any> = any> = IStateObject<T, E> & {
  readonly readonly: IStateObject<T, E>;
  change(input: StateObjectChanger<T> | T, action?: E['type']): IStateObjectChangeResponse<T>;
};

export type IStateObjectChangeResponse<T extends O> = {
  cid: string; // "change-id"
  cancelled: boolean;
  from: T;
  to: T;
};

export type StateObjectChanger<T extends O> = (draft: T) => void;

/**
 * [Events]
 */
export type StateObjectEvent =
  | IStateObjectChangingEvent
  | IStateObjectChangedEvent
  | IStateObjectCancelledEvent
  | IStateObjectDispatchEvent;

/**
 * Fires before the state object is updated
 * (after a `change` method completes).
 */
export type IStateObjectChangingEvent<T extends O = any, E extends Event<any> = any> = {
  type: 'StateObject/changing';
  payload: IStateObjectChanging<T, E>;
};
export type IStateObjectChanging<T extends O = any, E extends Event<any> = any> = {
  cid: string; // "change-id"
  from: T;
  to: T;
  cancelled: boolean;
  cancel(): void;
  action: E['type'];
};

/**
 * Fires AFTER the state object has been updated
 * (ie the "changing" event did not cancel the change).
 */
export type IStateObjectChangedEvent<T extends O = any, E extends Event<any> = any> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T, E>;
};
export type IStateObjectChanged<T extends O = any, E extends Event<any> = any> = {
  cid: string; // "change-id"
  from: T;
  to: T;
  action: E['type'];
};

/**
 * Fires when a change is cancelled.
 */
export type IStateObjectCancelledEvent<T extends O = any> = {
  type: 'StateObject/cancelled';
  payload: IStateObjectChanging<T>;
};
export type IStateObjectCancelled<T extends O = any> = IStateObjectChanging<T>;

/**
 * Fires when an event is fired via the `action` method (aka "dispatch").
 */
export type IStateObjectDispatchEvent<E extends Event<any> = any> = {
  type: 'StateObject/dispatch';
  payload: IStateObjectDispatch<E>;
};
export type IStateObjectDispatch<E extends Event<any> = any> = { event: E };
