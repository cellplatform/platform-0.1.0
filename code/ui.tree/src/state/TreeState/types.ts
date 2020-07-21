import * as t from '../../common/types';

type Node = t.ITreeNode;
type O = Record<string, unknown>;

export type TreeState = {
  create<N extends Node = Node>(args?: ITreeStateArgs<N>): ITreeState<N>;
  identity: t.TreeNodeIdentity;
  isInstance(input: any): boolean;
  children<T extends Node>(of: T, fn?: (children: T[]) => void): T[];
  props<P extends O>(of: Node, fn?: (props: P) => void): P;
};

export type ITreeStateArgs<N extends Node = Node> = {
  parent?: string; // ID of parent within tree.
  root?: N | string;
  dispose$?: t.Observable<any>;
};

/**
 * State machine for programming a tree,
 * or partial leaf within a tree.
 */
export type ITreeState<N extends Node = Node> = t.IDisposable & {
  readonly namespace: string;
  readonly id: string;
  readonly parent?: string; // ID of parent within tree.
  readonly root: N;
  readonly children: ITreeState[];
  readonly query: t.ITreeQuery<N>;
  readonly event$: t.Observable<TreeStateEvent>;
  readonly changed$: t.Observable<ITreeStateChanged<N>>;
  payload<E extends t.TreeStateEvent>(type: E['type']): t.Observable<E['payload']>;
  add: TreeStateAdd;
  remove(child: string | ITreeState): ITreeState;
  change: TreeStateChange<N>;
  toId(input?: string): string;
};

/**
 * Add
 */
export type TreeStateAdd = <C extends Node = Node>(args: TreeStateAddArgs<C>) => ITreeState<C>;
export type TreeStateAddArgs<C extends Node = Node> = {
  parent?: string;
  root: C | string | ITreeState<C>;
};

/**
 * Change.
 */
export type TreeStateChange<N extends Node = Node> = (
  fn: TreeStateChanger<N>,
  options?: TreeStateChangeOptions,
) => TreeStateChangeResponse<N>;
export type TreeStateChangeResponse<N extends Node = Node> = t.IStateObjectChangeResponse<N>;
export type TreeStateChangeOptions = { silent?: boolean };
export type TreeStateChanger<N extends Node = Node> = (
  root: N,
  ctx: TreeStateChangerContext<N>,
) => void;
export type TreeStateChangerContext<N extends Node = Node> = t.ITreeQuery<N>;

/**
 * [Events]
 */
export type TreeStateEvent =
  | ITreeStateChangedEvent
  | ITreeStateChildAddedEvent
  | ITreeStateChildRemovedEvent;

export type ITreeStateChangedEvent<N extends Node = Node> = {
  type: 'TreeState/changed';
  payload: ITreeStateChanged<N>;
};
export type ITreeStateChanged<N extends Node = Node> = {
  from: N;
  to: N;
  patches: t.StateObjectPatches;
};

export type ITreeStateChildAddedEvent = {
  type: 'TreeState/child/added';
  payload: ITreeStateChildAdded;
};
export type ITreeStateChildAdded = {
  parent: ITreeState;
  child: ITreeState;
};

export type ITreeStateChildRemovedEvent = {
  type: 'TreeState/child/removed';
  payload: ITreeStateChildRemoved;
};
export type ITreeStateChildRemoved = {
  parent: ITreeState;
  child: ITreeState;
};
