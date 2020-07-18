import * as t from '../common/types';

type Node = t.ITreeNode;

export type TreeState = {
  create<N extends Node = Node>(args: ITreeStateArgs<N>): ITreeState<N>;
};

export type ITreeStateArgs<N extends Node = Node> = {
  parent?: string; // ID of parent within tree.
  root: N;
  treeview$?: t.Observable<t.TreeViewEvent>;
  dispose$?: t.Observable<any>;
};

/**
 * State machine for programming a tree,
 * or partial leaf within a tree.
 */
export type ITreeState<N extends Node = Node> = t.IDisposable &
  ITreeTraverse<N> & {
    readonly namespace: string;
    readonly id: string;
    readonly parent?: string; // ID of parent within tree.
    readonly root: N;
    readonly children: ITreeState[];
    readonly event$: t.Observable<TreeStateEvent>;
    readonly changed$: t.Observable<ITreeStateChanged<N>>;
    payload<T extends t.TreeStateEvent>(type: T['type']): t.Observable<T['payload']>;
    add<C extends Node = Node>(args: { parent: string; root: C | string }): ITreeState<C>;
    remove(child: string | ITreeState): ITreeState;
    change: TreeStateChange<N>;
  };

/**
 * Change.
 */
export type TreeStateChange<N extends Node = Node> = (
  fn: TreeStateChanger<N>,
  options?: TreeStateChangeOptions,
) => void;
export type TreeStateChangeOptions = { silent?: boolean };
export type TreeStateChanger<N extends Node = Node> = (
  root: N,
  ctx: TreeStateChangerArgs<N>,
) => void;
export type TreeStateChangerArgs<N extends Node = Node> = ITreeTraverse<N> & {
  props(node: Node, fn?: (props: t.ITreeNodeProps) => void): t.ITreeNodeProps;
};

/**
 * Node traversal.
 */
export type ITreeTraverse<N extends Node> = {
  walkDown: TreeStateWalkDown<N>;
  find: TreeStateFind<N>;
};

export type TreeStateWalkDown<N extends Node> = (fn: (args: ITreeStateVisit<N>) => void) => void;
export type TreeStateFilter<N extends Node> = (args: ITreeStateVisit<N>) => boolean;
export type TreeStateFind<N extends Node> = (fn: TreeStateFilter<N>) => N | undefined;

export type ITreeStateVisit<N extends Node> = {
  id: string;
  namespace: string;
  node: N;
  stop(): void;
  skip(): void; // Skip children.
};

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
