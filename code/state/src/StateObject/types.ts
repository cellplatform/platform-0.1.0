import { Observable } from 'rxjs';

type O = Record<string, unknown>;

export type StateObject = {
  create<T extends O, A extends string = any>(initial: T): IStateObjectWritable<T, A>;
  readonly<T extends O, A extends string = any>(
    obj: IStateObjectWritable<T, A> | IStateObject<T, A>,
  ): IStateObject<T, A>;
};

/**
 * Read-only.
 */
export type IStateObject<T extends O, A extends string = any> = {
  readonly event$: Observable<StateObjectEvent>;
  readonly changing$: Observable<IStateObjectChanging<T>>;
  readonly changed$: Observable<IStateObjectChanged<T, A>>;
  readonly cancelled$: Observable<IStateObjectCancelled<T>>;
  readonly original: T;
  readonly state: T;
};

/**
 * Writeable.
 */
export type IStateObjectWritable<T extends O, A extends string = any> = IStateObject<T, A> & {
  readonly readonly: IStateObject<T>;
  change(input: StateObjectChanger<T> | T, action?: A): IStateObjectChangeResponse<T>;
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
export type IStateObjectChangedEvent<T extends O = any, A extends string = any> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T, A>;
};
export type IStateObjectChanged<T extends O = any, A extends string = any> = {
  cid: string; // "change-id"
  from: T;
  to: T;
  action: A;
};

/**
 * Fires if a change is cancelled.
 */
export type IStateObjectCancelledEvent<T extends O = any> = {
  type: 'StateObject/cancelled';
  payload: IStateObjectChanging<T>;
};
export type IStateObjectCancelled<T extends O = any> = IStateObjectChanging<T>;
