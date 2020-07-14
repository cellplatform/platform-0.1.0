import { Observable } from 'rxjs';

export type IStateObject<T extends Record<string, unknown>> = {
  readonly event$: Observable<StateObjectEvent>;
  readonly changed$: Observable<IStateObjectChanged<T>>;
  readonly original: T;
  readonly state: T;
};

export type IStateObjectWritable<T extends Record<string, unknown>> = IStateObject<T> & {
  change(fn: StateObjectChange<T>): IStateObject<T>;
};

export type StateObjectChange<T extends Record<string, unknown>> = (draft: T) => void;

/**
 * [Events]
 */
export type StateObjectEvent = IStateObjectChangedEvent<any>;

export type IStateObjectChangedEvent<T extends Record<string, unknown> = any> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T>;
};
export type IStateObjectChanged<T extends Record<string, unknown> = any> = {
  from: T;
  to: T;
};
