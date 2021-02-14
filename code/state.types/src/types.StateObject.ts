import * as t from './common';

type O = Record<string, unknown>;
type CombineObject = { [key: string]: O };

/**
 * Static entry point and helpers.
 */
export type StateObject = {
  create<T extends O>(initial: T): IStateObjectWritable<T>;

  readonly<T extends O>(
    obj: IStateObjectWritable<T> | IStateObjectReadable<T>,
  ): IStateObjectReadable<T>;

  combine<T extends CombineObject>(
    initial: T | Record<keyof T, t.IStateObject<T[keyof T]>>,
    dispose$?: t.Observable<any>,
  ): StateMerger<T>;

  toObject<T>(draft?: any): T | undefined;
  isStateObject(input: any): boolean;
  isProxy(input: any): boolean;
};

/**
 * Read-only.
 */
export type IStateObject<T extends O> = IStateObjectReadable<T>;
export type IStateObjectReadable<T extends O> = {
  readonly original: T;
  readonly state: T;
  readonly event: t.IStateObjectEvents<T>;
  readonly isDisposed: boolean;
};

/**
 * Writeable.
 */
export type IStateObjectWritable<T extends O> = IStateObjectReadable<T> &
  t.IDisposable & {
    readonly readonly: IStateObject<T>;
    change: StateObjectChange<T>;
    changeAsync: StateObjectChangeAsync<T>;
  };

export type StateObjectChange<T extends O> = (
  input: StateObjectChanger<T> | T,
) => IStateObjectChangeResponse<T>;

export type StateObjectChangeAsync<T extends O> = (
  input: StateObjectChangerAsync<T>,
) => Promise<IStateObjectChangeResponse<T>>;

export type StateObjectChangeOperation = 'update' | 'replace';

export type IStateObjectChangeResponse<T extends O> = {
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  patches: t.PatchSet;
  changed?: t.IStateObjectChanged<T>;
  cancelled?: t.IStateObjectCancelled<T>;
};
export type StateObjectChanger<T extends O> = (draft: T) => void;
export type StateObjectChangerAsync<T extends O> = (draft: T) => Promise<void>;

/**
 * Merge
 */
export type StateMerger<T extends CombineObject> = {
  readonly store: t.IStateObjectReadable<T>;
  readonly state: T;
  readonly changed$: t.Observable<t.IStateObjectChanged>;
  add<K extends keyof T>(
    key: K,
    subject: t.IStateObject<T[K]> | t.Observable<t.IStateObjectChanged>,
  ): StateMerger<T>;
  dispose(): void;
};
