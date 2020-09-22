import * as t from './common';

type O = Record<string, unknown>;
type Event = t.Event<O>;
type MergeObject = { [key: string]: O };

/**
 * Static entry point.
 */
export type StateObject = {
  create<T extends O, A extends Event = Event>(initial: T): IStateObjectWritable<T, A>;

  readonly<T extends O, A extends Event = Event>(
    obj: IStateObjectWritable<T, A> | IStateObjectReadable<T, A>,
  ): IStateObjectReadable<T, A>;

  merge<T extends MergeObject, A extends Event = Event>(
    initial: T | Record<keyof T, t.IStateObject<T[keyof T]>>,
    dispose$?: t.Observable<any>,
  ): StateMerger<T, A>;

  toObject<T>(draft?: any): T | undefined;
  isStateObject(input: any): boolean;
};

/**
 * Read-only.
 */
export type IStateObject<T extends O, A extends Event = Event> = IStateObjectReadable<T, A>;
export type IStateObjectReadable<T extends O, A extends Event = Event> = {
  readonly original: T;
  readonly state: T;
  readonly event: IStateObjectEvents<T, A>;
  readonly isDisposed: boolean;
};

export type IStateObjectEvents<T extends O, A extends Event = Event> = {
  readonly $: t.Observable<StateObjectEvent>;
  readonly changing$: t.Observable<IStateObjectChanging<T>>;
  readonly changed$: t.Observable<IStateObjectChanged<T, A>>;
  readonly patched$: t.Observable<IStateObjectPatched<A>>;
  readonly cancelled$: t.Observable<IStateObjectCancelled<T>>;
  readonly dispose$: t.Observable<any>;
};

/**
 * Writeable.
 */
export type IStateObjectWritable<T extends O, A extends Event = Event> = IStateObjectReadable<
  T,
  A
> &
  t.IDisposable & {
    readonly readonly: IStateObject<T, A>;
    change: StateObjectChange<T, A>;
  };

export type StateObjectChange<T extends O, A extends Event> = (
  input: StateObjectChanger<T> | T,
  options?: IStateObjectChangeOptions<A>,
) => IStateObjectChangeResponse<T>;

export type StateObjectChangeOperation = 'update' | 'replace';
export type IStateObjectChangeOptions<A extends Event> = { action?: A['type'] };

export type IStateObjectChangeResponse<T extends O, A extends Event = Event> = {
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  patches: t.PatchSet;
  changed?: IStateObjectChanged<T, A>;
  cancelled?: IStateObjectCancelled<T>;
};
export type StateObjectChanger<T extends O> = (draft: T) => void;

/**
 * Merge
 */
export type StateMerger<T extends MergeObject, A extends Event = Event> = {
  readonly store: t.IStateObjectReadable<T, A>;
  readonly state: T;
  readonly changed$: t.Observable<t.IStateObjectChanged>;
  add<K extends keyof T>(
    key: K,
    subject: t.IStateObject<T[K]> | t.Observable<t.IStateObjectChanged>,
  ): StateMerger<T, A>;
  dispose(): void;
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
export type IStateObjectChangingEvent<T extends O = any, A extends Event = Event> = {
  type: 'StateObject/changing';
  payload: IStateObjectChanging<T, A>;
};
export type IStateObjectChanging<T extends O = any, A extends Event = Event> = {
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  from: T;
  to: T;
  patches: t.PatchSet;
  cancelled: boolean;
  cancel(): void;
  action: A['type'];
};

/**
 * Fires AFTER the state object has been updated
 * (ie the "changing" event did not cancel the change).
 */
export type IStateObjectChangedEvent<T extends O = any, A extends Event = Event> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T, A>;
};
export type IStateObjectChanged<T extends O = any, A extends Event = Event> = {
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  patches: t.PatchSet;
  action: A['type'];
  from: T;
  to: T;
};

/**
 * Equivalent to CHANGED event, but only delivers change patches.
 * (NB: this can is useful for sending more lightweight payloads).
 */

export type IStateObjectPatchedEvent<A extends Event = Event> = {
  type: 'StateObject/changed/patched';
  payload: IStateObjectPatched<A>;
};
export type IStateObjectPatched<A extends Event = Event> = {
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  prev: t.PatchSet['prev'];
  next: t.PatchSet['next'];
  action: A['type'];
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
