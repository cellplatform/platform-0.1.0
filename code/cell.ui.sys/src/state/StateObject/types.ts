import { Observable } from 'rxjs';

export type IStateObject<T extends object> = {
  readonly event$: Observable<StateObjectEvent>;
  readonly original: T;
  readonly state: T;
};

export type IStateObjectWritable<T extends object> = IStateObject<T> & {
  change(fn: StateObjectChange<T>): IStateObject<T>;
};

export type StateObjectChange<T extends object> = (draft: T) => void;

export type IStateObjectPatch = {
  op: 'replace' | 'remove' | 'add';
  path: (string | number)[];
  value?: any;
};

/**
 * [Events]
 */
export type StateObjectEvent = IStateObjectChangedEvent<any>;

export type IStateObjectChangedEvent<T extends object = {}> = {
  type: 'StateObject/changed';
  payload: IStateObjectChanged<T>;
};
export type IStateObjectChanged<T extends object = {}> = {
  state: T;
  patches: IStateObjectPatch[];
};
