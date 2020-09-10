import * as t from './common';

type O = Record<string, unknown>;
type N = t.ITreeNode;
type E = t.Event<O>;

export type TreeState = {
  create<T extends N = N, A extends E = any>(args?: ITreeStateArgs<T>): ITreeState<T, A>;
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
export type ITreeState<T extends N = N, A extends E = any> = t.IDisposable &
  t.ITreeStateReadonly<T, A> & {
    readonly readonly: ITreeStateReadonly<T, A>;
    add: TreeStateAdd;
    remove(child: string | ITreeState): ITreeState<T>;
    clear(): ITreeState<T>;
    change: TreeStateChange<T, A>;
    syncFrom: TreeStateSyncFrom;
    formatId(input?: string): string;
    path: t.ITreeStatePath<T, A>;
  };

export type ITreeStateReadonly<T extends N, A extends E> = {
  readonly isDisposed: boolean;
  readonly dispose$: t.Observable<void>;
  readonly id: string;
  readonly key: string;
  readonly namespace: string;
  readonly parent?: string; // ID of parent within tree.
  readonly store: t.IStateObjectReadOnly<T>;
  readonly root: T;
  readonly children: readonly ITreeState<T, A>[];
  readonly query: t.ITreeQuery<T>;
  readonly event: ITreeStateEvents<T, A>;
  action: t.IStateObjectDispatchMethods<T, A>['action'];
  find: t.TreeStateFind<T, A>;
  contains: t.TreeStateContains<T, A>;
  walkDown: t.TreeStateWalkDown<T, A>;
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
export type TreeStateChange<T extends N = N, A extends E = E> = (
  fn: TreeStateChanger<T>,
  options?: TreeStateChangeOptions<A>,
) => TreeStateChangeResponse<T>;
export type TreeStateChangeResponse<T extends N = N> = t.IStateObjectChangeResponse<T>;
export type TreeStateChangeOptions<A extends E> = { action?: A['type'] };
export type TreeStateChanger<T extends N = N, P extends O = NonNullable<T['props']>> = (
  root: T,
  ctx: TreeStateChangerContext<T, P>,
) => void;
export type TreeStateChangerContext<
  T extends N = N,
  P extends O = NonNullable<T['props']>
> = t.ITreeQuery<T> & {
  query(root?: T, namespace?: string): t.ITreeQuery<T>;
  children<C extends T>(of: C, fn?: (children: C[]) => void): C[];
  props(of: N, fn?: (props: P) => void): P;
  toObject<T extends O>(draft?: T): T | undefined;
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
export type ITreeStatePath<T extends N = N, A extends E = any> = {
  from(child: t.NodeIdentifier): string;
  get(path: string): t.ITreeState<T, A> | undefined;
};

/**
 * Walk
 */
export type TreeStateWalkDown<T extends N, A extends E = any> = (
  visit: TreeStateWalkDownVisitor<T, A>,
) => void;
export type TreeStateWalkDownVisitor<T extends N, A extends E = any> = (
  args: ITreeStateDescend<T, A>,
) => void;

/**
 * Arguments for tree walking operations.
 */
export type ITreeStateWalk<T extends N = N, A extends E = any> = {
  id: string;
  key: string;
  namespace: string;
  index: number; // Within siblings.
  tree: t.ITreeState<T, A>;
  parent?: t.ITreeState<T, A>;
  level: number;
  toString(): string; // fully-qualified identifier, eg. "<namespace>:<id>"
};

/**
 * Arguments for walking a tree (top-down).
 */
export type ITreeStateDescend<T extends N = N, A extends E = any> = ITreeStateWalk<T, A> & {
  stop(): void;
  skip(): void; // Skip children.
};

/**
 * Arguments for walking a tree (bottom-down).
 */
export type ITreeStateAscend<T extends N = N, A extends E = any> = ITreeStateWalk<T, A> & {
  stop(): void;
};

/**
 * Find
 */
export type TreeStateFind<T extends N = N, A extends E = E> = (
  match?: TreeStateFindMatch<T, A> | t.NodeIdentifier,
) => t.ITreeState<T, A> | undefined;
export type TreeStateFindMatch<T extends N, A extends E = E> = (
  args: ITreeStateDescend<T, A>,
) => boolean;

export type TreeStateContains<T extends N = N, A extends E = E> = (
  match?: TreeStateFindMatch<T, A> | t.NodeIdentifier,
) => boolean;

/**
 * [Events]
 */

export type ITreeStateEvents<T extends N, A extends E> = {
  readonly $: t.Observable<TreeStateEvent | A>;
  readonly changed$: t.Observable<ITreeStateChanged<T>>;
  readonly patched$: t.Observable<ITreeStatePatched<A>>;
  readonly childAdded$: t.Observable<ITreeStateChildAdded>;
  readonly childRemoved$: t.Observable<ITreeStateChildRemoved>;
  payload<E extends t.TreeStateEvent | A>(type: E['type']): t.Observable<E['payload']>;
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
export type ITreeStatePatchedEvent<A extends E = E> = {
  type: 'TreeState/patched';
  payload: ITreeStatePatched<A>;
};
export type ITreeStatePatched<A extends E = E> = t.IStateObjectPatched<A>;

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
