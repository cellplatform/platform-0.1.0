import * as t from './common';

type O = Record<string, unknown>;

export type IStateObjectEvents<T extends O, A extends string = string> = {
  readonly $: t.Observable<t.StateObjectEvent>;
  readonly changing$: t.Observable<t.IStateObjectChanging<T>>;
  readonly changed$: t.Observable<t.IStateObjectChanged<T, A>>;
  readonly patched$: t.Observable<t.IStateObjectPatched<A>>;
  readonly cancelled$: t.Observable<t.IStateObjectCancelled<T>>;
  readonly dispose$: t.Observable<any>;
};

/**
 * [Events]
 */

export type StateObjectEvent =
  | IStateObjectChangingEvent
  | IStateObjectChangedEvent
  | IStateObjectPatchedEvent
  | IStateObjectCancelledEvent
  | IStateObjectDisposedEvent;

/**
 * Fires before the state object is updated
 * (after a `change` method completes).
 */
export type IStateObjectChangingEvent<T extends O = any, A extends string = string> = {
  type: 'StateObject/changing';
  payload: IStateObjectChanging<T, A>;
};
export type IStateObjectChanging<T extends O = any, A extends string = string> = {
  op: t.StateObjectChangeOperation;
  cid: string; // "change-id"
  from: T;
  to: T;
  patches: t.PatchSet;
  cancelled: boolean;
  cancel(): void;
  action: A;
};

/**
 * Fires AFTER the state object has been updated
 * (ie the "changing" event did not cancel the change).
 */
export type IStateObjectChangedEvent<T extends O = any, A extends string = string> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T, A>;
};
export type IStateObjectChanged<T extends O = any, A extends string = string> = {
  op: t.StateObjectChangeOperation;
  cid: string; // "change-id"
  patches: t.PatchSet;
  action: A;
  from: T;
  to: T;
};

/**
 * Equivalent to CHANGED event, but only delivers change patches.
 * (NB: this can is useful for sending more lightweight payloads).
 */

export type IStateObjectPatchedEvent<A extends string = string> = {
  type: 'StateObject/changed/patched';
  payload: IStateObjectPatched<A>;
};
export type IStateObjectPatched<A extends string = string> = {
  op: t.StateObjectChangeOperation;
  cid: string; // "change-id"
  prev: t.PatchSet['prev'];
  next: t.PatchSet['next'];
  action: A;
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
 * Fires when the state object is disposed of.
 */
export type IStateObjectDisposedEvent<T extends O = any> = {
  type: 'StateObject/disposed';
  payload: IStateObjectDisposed<T>;
};
export type IStateObjectDisposed<T extends O = any> = { original: T; final: T };
