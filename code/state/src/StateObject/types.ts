import { Observable } from 'rxjs';

export type IStateObject<T extends object> = {
  readonly event$: Observable<StateObjectEvent>;
  readonly changed$: Observable<IStateObjectChanged<T>>;
  readonly original: T;
  readonly state: T;
};

export type IStateObjectWritable<T extends object> = IStateObject<T> & {
  change(fn: StateObjectChange<T>): IStateObject<T>;
};

export type StateObjectChange<T extends object> = (draft: T) => void;

/**
 * [Events]
 */
export type StateObjectEvent = IStateObjectChangedEvent<any>;

export type IStateObjectChangedEvent<T extends object = {}> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T>;
};
export type IStateObjectChanged<T extends object = {}> = {
  from: T;
  to: T;
};
