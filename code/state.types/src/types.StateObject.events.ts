import * as t from './common';

type O = Record<string, unknown>;

export type IStateObjectEvents<T extends O> = {
  readonly $: t.Observable<t.StateObjectEvent>;
  readonly changing$: t.Observable<t.IStateObjectChanging<T>>;
  readonly changed$: t.Observable<t.IStateObjectChanged<T>>;
  readonly patched$: t.Observable<t.IStateObjectPatched>;
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
export type IStateObjectChangingEvent<T extends O = any> = {
  type: 'StateObject/changing';
  payload: IStateObjectChanging<T>;
};
export type IStateObjectChanging<T extends O = any> = {
  op: t.StateChangeOperation;
  cid: string; // "change-id"
  from: T;
  to: T;
  patches: t.PatchSet;
  cancelled: boolean;
  cancel(): void;
};

/**
 * Fires AFTER the state object has been updated
 * (ie the "changing" event did not cancel the change).
 */
export type IStateObjectChangedEvent<T extends O = any> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T>;
};
export type IStateObjectChanged<T extends O = any> = {
  op: t.StateChangeOperation;
  cid: string; // "change-id"
  patches: t.PatchSet;
  from: T;
  to: T;
};

/**
 * Equivalent to CHANGED event, but only delivers change patches.
 * (NB: this can is useful for sending more lightweight payloads).
 */

export type IStateObjectPatchedEvent = {
  type: 'StateObject/changed/patched';
  payload: IStateObjectPatched;
};
export type IStateObjectPatched = {
  op: t.StateChangeOperation;
  cid: string; // "change-id"
  prev: t.PatchSet['prev'];
  next: t.PatchSet['next'];
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
