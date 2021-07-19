import * as t from './common';

type O = Record<string, unknown>;
type N = t.ITreeNode;

export type TreeState = {
  create<T extends N = N>(args?: ITreeStateArgs<T>): ITreeState<T>;
  identity: t.TreeIdentity;
  isInstance(input: any): boolean;
  children<T extends N>(of: T, fn?: (children: T[]) => void): T[];
  props<P extends O>(of: N, fn?: (props: P) => void): P;
};

export type ITreeStateArgs<T extends N = N> = {
  /**
   * ID of parent within tree.
   */
  parent?: string;

  /**
   * Root {node} of ID of root node.
   */
  root?: T | string;

  /**
   * Dispose event.
   */
  dispose$?: t.Observable<any>;
};

/**
 * State machine for programming a tree,
 * or partial leaf within a tree.
 */
export type ITreeState<T extends N = N> = t.IDisposable &
  t.ITreeStateReadonly<T> & {
    readonly readonly: ITreeStateReadonly<T>;
    add: TreeStateAdd;
    remove(child: string | ITreeState<any>): ITreeState<T>;
    clear(): ITreeState<T>;
    change: TreeStateChange<T>;
    changeAsync: TreeStateChangeAsync<T>;
    syncFrom: TreeStateSyncFrom;
    path: t.ITreeStatePath<T>;
  };

export type ITreeStateReadonly<T extends N> = {
  readonly isDisposed: boolean;
  readonly dispose$: t.Observable<void>;
  readonly id: string;
  readonly key: string;
  readonly namespace: string;
  readonly parent?: string; // ID of parent within tree.
  readonly state: T;
  readonly children: readonly ITreeState<T>[];
  readonly query: t.ITreeQuery<T>;
  readonly event: ITreeStateEvents<T>;
  find: t.TreeStateFind<T>;
  contains: t.TreeStateContains<T>;
  walkDown: t.TreeStateWalkDown<T>;
};

/**
 * Add
 */
export type TreeStateAdd = <T extends N = N>(
  args: TreeStateAddArgs<T> | ITreeState<T>,
) => ITreeState<T>;
export type TreeStateAddArgs<T extends N = N> = {
  parent?: string;
  root: T | string | ITreeState<T>;
};

/**
 * Change
 */
export type TreeStateChange<T extends N = N> = (
  fn: TreeStateChanger<T>,
) => TreeStateChangeResponse<T>;

export type TreeStateChangeAsync<T extends N = N> = (
  fn: TreeStateChangerAsync<T>,
) => Promise<TreeStateChangeResponse<T>>;

export type TreeStateChangeResponse<T extends N> = t.IStateObjectChangeResponse<T>;

export type TreeStateChanger<T extends N = N, P extends O = NonNullable<T['props']>> = (
  root: T,
  ctx: TreeStateChangerContext<T, P>,
) => void;

export type TreeStateChangerAsync<T extends N = N, P extends O = NonNullable<T['props']>> = (
  root: T,
  ctx: TreeStateChangerContext<T, P>,
) => Promise<void>;

export type TreeStateChangerContext<
  T extends N = N,
  P extends O = NonNullable<T['props']>,
> = t.ITreeQuery<T> & {
  query(root?: T, namespace?: string): t.ITreeQuery<T>;
  children<C extends T>(of: C, fn?: (children: C[]) => void): C[];
  props(of: N, fn?: (props: P) => void): P;
  toObject<D>(draft?: D): D | undefined;
};

/**
 * Sync
 */
export type TreeStateSyncFrom<T extends N = N> = (args: {
  source: TreeStateSyncSourceArg<T>;
  until$?: t.Observable<any>;
}) => TreeStateSyncer;
export type TreeStateSyncSourceArg<T extends N = N> =
  | t.ITreeState<T>
  | { event$: t.Observable<t.TreeStateEvent>; parent: string };
export type TreeStateSyncer = t.IDisposable & {
  readonly parent: string;
};

/**
 * Path
 */
export type ITreeStatePath<T extends N = N> = {
  from(child: t.NodeIdentifier): string;
  get(path: string): t.ITreeState<T> | undefined;
};

/**
 * Walk
 */
export type TreeStateWalkDown<T extends N> = (visit: TreeStateWalkDownVisitor<T>) => void;
export type TreeStateWalkDownVisitor<T extends N> = (args: ITreeStateDescend<T>) => void;

/**
 * Arguments for tree walking operations.
 */
export type ITreeStateWalk<T extends N = N> = {
  id: string;
  key: string;
  namespace: string;
  index: number; // Within siblings.
  tree: t.ITreeState<T>;
  parent?: t.ITreeState<T>;
  level: number;
  toString(): string; // fully-qualified identifier, eg. "<namespace>:<id>"
};

/**
 * Arguments for walking a tree (top-down).
 */
export type ITreeStateDescend<T extends N = N> = ITreeStateWalk<T> & {
  stop(): void;
  skip(): void; // Skip children.
};

/**
 * Arguments for walking a tree (bottom-down).
 */
export type ITreeStateAscend<T extends N = N> = ITreeStateWalk<T> & {
  stop(): void;
};

/**
 * Find
 */
export type TreeStateFind<T extends N = N> = (
  match?: TreeStateFindMatch<T> | t.NodeIdentifier,
) => t.ITreeState<T> | undefined;
export type TreeStateFindMatch<T extends N> = (args: ITreeStateDescend<T>) => boolean;

export type TreeStateContains<T extends N = N> = (
  match?: TreeStateFindMatch<T> | t.NodeIdentifier,
) => boolean;

/**
 * [Events]
 */

export type ITreeStateEvents<T extends N> = {
  readonly $: t.Observable<TreeStateEvent>;
  readonly changed$: t.Observable<ITreeStateChanged<T>>;
  readonly patched$: t.Observable<ITreeStatePatched>;
  readonly childAdded$: t.Observable<ITreeStateChildAdded>;
  readonly childRemoved$: t.Observable<ITreeStateChildRemoved>;
  payload<E extends t.TreeStateEvent>(type: E['type']): t.Observable<E['payload']>;
};

export type TreeStateEvent =
  | ITreeStateChangedEvent
  | ITreeStatePatchedEvent
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
 * Fired when the [TreeState] data changes (change patches only).
 */
export type ITreeStatePatchedEvent = {
  type: 'TreeState/patched';
  payload: ITreeStatePatched;
};
export type ITreeStatePatched = t.IStateObjectPatched;

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
