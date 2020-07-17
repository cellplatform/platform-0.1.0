import { Observable } from 'rxjs';
import { Event } from '@platform/types';

type O = Record<string, unknown>;

export type StateObject = {
  create<T extends O, E extends Event<any> = any>(initial: T): IStateObjectWritable<T, E>;
  readonly<T extends O, E extends Event<any> = any>(
    obj: IStateObjectWritable<T, E> | IStateObject<T, E>,
  ): IStateObject<T, E>;
};

/**
 * Read-only.
 */
export type IStateObject<T extends O, E extends Event<any> = any> = {
  readonly event$: Observable<StateObjectEvent>;
  readonly changing$: Observable<IStateObjectChanging<T>>;
  readonly changed$: Observable<IStateObjectChanged<T, E>>;
  readonly cancelled$: Observable<IStateObjectCancelled<T>>;
  readonly original: T;
  readonly state: T;
};

/**
 * Writeable.
 */
export type IStateObjectWritable<T extends O, E extends Event<any> = any> = IStateObject<T, E> & {
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
  | IStateObjectChangingEvent<any>
  | IStateObjectChangedEvent<any>
  | IStateObjectCancelledEvent;

/**
 * Fires before the state object is updated
 * (after a `change` method completes).
 */
export type IStateObjectChangingEvent<T extends O = any> = {
  type: 'StateObject/changing';
  payload: IStateObjectChanging<T>;
};
export type IStateObjectChanging<T extends O = any> = {
  cid: string; // "change-id"
  from: T;
  to: T;
  cancelled: boolean;
  cancel(): void;
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
 * Fires if a change is cancelled.
 */
export type IStateObjectCancelledEvent<T extends O = any> = {
  type: 'StateObject/cancelled';
  payload: IStateObjectChanging<T>;
};
export type IStateObjectCancelled<T extends O = any> = IStateObjectChanging<T>;
