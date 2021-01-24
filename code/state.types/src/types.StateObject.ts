import * as t from './common';

type O = Record<string, unknown>;
type CombineObject = { [key: string]: O };

/**
 * Static entry point and helpers.
 */
export type StateObject = {
  create<T extends O, A extends string = string>(initial: T): IStateObjectWritable<T, A>;

  readonly<T extends O, A extends string = string>(
    obj: IStateObjectWritable<T, A> | IStateObjectReadable<T, A>,
  ): IStateObjectReadable<T, A>;

  combine<T extends CombineObject, A extends string = string>(
    initial: T | Record<keyof T, t.IStateObject<T[keyof T]>>,
    dispose$?: t.Observable<any>,
  ): StateMerger<T, A>;

  toObject<T>(draft?: any): T | undefined;
  isStateObject(input: any): boolean;
};

/**
 * Read-only.
 */
export type IStateObject<T extends O, A extends string = string> = IStateObjectReadable<T, A>;
export type IStateObjectReadable<T extends O, A extends string = string> = {
  readonly original: T;
  readonly state: T;
  readonly event: t.IStateObjectEvents<T, A>;
  readonly isDisposed: boolean;
};

/**
 * Writeable.
 */
export type IStateObjectWritable<T extends O, A extends string = string> = IStateObjectReadable<
  T,
  A
> &
  t.IDisposable & {
    readonly readonly: IStateObject<T, A>;
    change: StateObjectChange<T, A>;
  };

export type StateObjectChange<T extends O, A extends string> = (
  input: StateObjectChanger<T> | T,
  options?: IStateObjectChangeOptions<A>,
) => IStateObjectChangeResponse<T>;

export type StateObjectChangeOperation = 'update' | 'replace';
export type IStateObjectChangeOptions<A extends string> = { action?: A };

export type IStateObjectChangeResponse<T extends O, A extends string = string> = {
  op: StateObjectChangeOperation;
  cid: string; // "change-id"
  patches: t.PatchSet;
  changed?: t.IStateObjectChanged<T, A>;
  cancelled?: t.IStateObjectCancelled<T>;
};
export type StateObjectChanger<T extends O> = (draft: T) => void;

/**
 * Merge
 */
export type StateMerger<T extends CombineObject, A extends string = string> = {
  readonly store: t.IStateObjectReadable<T, A>;
  readonly state: T;
  readonly changed$: t.Observable<t.IStateObjectChanged>;
  add<K extends keyof T>(
    key: K,
    subject: t.IStateObject<T[K]> | t.Observable<t.IStateObjectChanged>,
  ): StateMerger<T, A>;
  dispose(): void;
};
