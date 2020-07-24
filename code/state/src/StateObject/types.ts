import { Observable } from 'rxjs';
import { Event, IDisposable } from '@platform/types';
import { PatchOperation } from '../Patch/types';

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
  readonly event: IStateObjectEvents<T, E>;
  dispatch(event: E): void;
  dispatched(action: E['type'], takeUntil$?: Observable<any>): Observable<E['payload']>;
  changed(action: E['type'], takeUntil$?: Observable<any>): Observable<IStateObjectChanged<T, E>>;
};

export type IStateObjectEvents<T extends O, E extends Event<any> = any> = {
  readonly $: Observable<StateObjectEvent>;
  readonly changing$: Observable<IStateObjectChanging<T>>;
  readonly changed$: Observable<IStateObjectChanged<T, E>>;
  readonly cancelled$: Observable<IStateObjectCancelled<T>>;
  readonly dispatch$: Observable<E>;
};

/**
 * Writeable.
 */
export type IStateObjectWrite<T extends O, E extends Event<any> = any> = IStateObject<T, E> &
  IDisposable & {
    readonly readonly: IStateObject<T, E>;
    change(input: StateObjectChanger<T> | T, action?: E['type']): IStateObjectChangeResponse<T>;
  };

export type StateObjectChangeOperation = 'update' | 'replace';

export type IStateObjectChangeResponse<T extends O> = {
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  cancelled: boolean;
  from: T;
  to: T;
  patches: StateObjectPatches;
};
export type StateObjectPatches = { prev: PatchOperation[]; next: PatchOperation[] };
export type StateObjectChanger<T extends O> = (draft: T) => void;

/**
 * [Events]
 */
export type StateObjectEvent =
  | IStateObjectChangingEvent
  | IStateObjectChangedEvent
  | IStateObjectCancelledEvent
  | IStateObjectDispatchEvent
  | IStateObjectDisposedEvent;

/**
 * Fires before the state object is updated
 * (after a `change` method completes).
 */
export type IStateObjectChangingEvent<T extends O = any, E extends Event<any> = any> = {
  type: 'StateObject/changing';
  payload: IStateObjectChanging<T, E>;
};
export type IStateObjectChanging<T extends O = any, E extends Event<any> = any> = {
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  from: T;
  to: T;
  patches: StateObjectPatches;
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
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  from: T;
  to: T;
  patches: StateObjectPatches;
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

/**
 * Fires when the state object is disposed of.
 */
export type IStateObjectDisposedEvent<T extends O = any> = {
  type: 'StateObject/disposed';
  payload: IStateObjectDisposed<T>;
};
export type IStateObjectDisposed<T extends O = any> = { original: T; final: T };
