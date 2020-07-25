import * as t from '../../common/types';

type N = t.ITreeNode;
type O = Record<string, unknown>;

export type TreeState = {
  create<T extends N = N>(args?: ITreeStateArgs<T>): ITreeState<T>;
  identity: t.TreeNodeIdentity;
  isInstance(input: any): boolean;
  children<T extends N>(of: T, fn?: (children: T[]) => void): T[];
  props<P extends O>(of: N, fn?: (props: P) => void): P;
};

export type ITreeStateArgs<T extends N = N> = {
  parent?: string; // ID of parent within tree.
  root?: T | string;
  dispose$?: t.Observable<any>;
};

/**
 * State machine for programming a tree,
 * or partial leaf within a tree.
 */
export type ITreeState<T extends N = N> = t.IDisposable & {
  readonly namespace: string;
  readonly id: string;
  readonly parent?: string; // ID of parent within tree.
  readonly store: t.IStateObjectReadOnly<T>;
  readonly root: T;
  readonly children: readonly ITreeState[];
  readonly query: t.ITreeQuery<T>;
  readonly event: ITreeStateEvents<T>;
  add: TreeStateAdd;
  remove(child: string | ITreeState): ITreeState;
  change: TreeStateChange<T>;
  find: TreeStateFind<T>;
  toId(input?: string): string;
};

export type ITreeStateEvents<T extends N = N> = {
  readonly $: t.Observable<TreeStateEvent>;
  readonly changed$: t.Observable<ITreeStateChanged<T>>;
  payload<E extends t.TreeStateEvent>(type: E['type']): t.Observable<E['payload']>;
};

/**
 * Add
 */
export type TreeStateAdd = <T extends N = N>(args: TreeStateAddArgs<T>) => ITreeState<T>;
export type TreeStateAddArgs<T extends N = N> = {
  parent?: string;
  root: T | string | ITreeState<T>;
};

/**
 * Change
 */
export type TreeStateChange<T extends N = N> = (
  fn: TreeStateChanger<T>,
  options?: TreeStateChangeOptions,
) => TreeStateChangeResponse<T>;
export type TreeStateChangeResponse<T extends N = N> = t.IStateObjectChangeResponse<T>;
export type TreeStateChangeOptions = { silent?: boolean };
export type TreeStateChanger<T extends N = N> = (root: T, ctx: TreeStateChangerContext<T>) => void;
export type TreeStateChangerContext<T extends N = N> = t.ITreeQuery<T>;

/**
 * Find
 */
export type TreeStateFind<T extends N = N> = (
  match: TreeStateFindMatch<T>,
) => t.ITreeState<T> | undefined;
export type TreeStateFindMatch<T extends N> = (args: TreeStateFindMatchArgs<T>) => boolean;
export type TreeStateFindMatchArgs<T extends N = N> = {
  level: number;
  id: string;
  namespace: string;
  tree: ITreeState<T>;
  stop(): void;
};

type ReadArray<T> = {
  map: Array<T>['map'];
};

/**
 * [Events]
 */
export type TreeStateEvent =
  | ITreeStateChangedEvent
  | ITreeStateChildAddedEvent
  | ITreeStateChildRemovedEvent
  | ITreeStateDisposedEvent;

/**
 * Fired when the [TreeState] data changes.
 */
export type ITreeStateChangedEvent<T extends N = N> = {
  type: 'TreeState/changed';
  payload: ITreeStateChanged<T>;
};
export type ITreeStateChanged<T extends N = N> = t.IStateObjectChanged<T>;

/**
 * Fired when a child [TreeState] is added.
 */
export type ITreeStateChildAddedEvent = {
  type: 'TreeState/child/added';
  payload: ITreeStateChildAdded;
};
export type ITreeStateChildAdded = {
  parent: ITreeState;
  child: ITreeState;
};

/**
 * Fired when a child [TreeState] is removed.
 */
export type ITreeStateChildRemovedEvent = {
  type: 'TreeState/child/removed';
  payload: ITreeStateChildRemoved;
};
export type ITreeStateChildRemoved = {
  parent: ITreeState;
  child: ITreeState;
};

/**
 * Fires when the [TreeState] is disposed of.
 */
export type ITreeStateDisposedEvent<T extends N = N> = {
  type: 'TreeState/disposed';
  payload: ITreeStateDisposed<T>;
};
export type ITreeStateDisposed<T extends N = N> = { final: T };
