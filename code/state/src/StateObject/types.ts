import { Observable } from 'rxjs';

type O = Record<string, unknown>;

export type StateObject = {
  create<T extends O>(initial: T): IStateObjectWritable<T>;
  readonly<T extends O>(obj: IStateObjectWritable<T>): IStateObject<T>;
};

/**
 * Read-only.
 */
export type IStateObject<T extends O> = {
  readonly event$: Observable<StateObjectEvent>;
  readonly changing$: Observable<IStateObjectChanging<T>>;
  readonly changed$: Observable<IStateObjectChanged<T>>;
  readonly original: T;
  readonly state: T;
};

/**
 * Writeable.
 */
export type IStateObjectWritable<T extends O> = IStateObject<T> & {
  change(fn: StateObjectChanger<T>): IStateObjectChangeResponse<T>;
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
export type StateObjectEvent = IStateObjectChangingEvent<any> | IStateObjectChangedEvent<any>;

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
export type IStateObjectChangedEvent<T extends O = any> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T>;
};
export type IStateObjectChanged<T extends O = any> = {
  cid: string; // "change-id"
  from: T;
  to: T;
};
