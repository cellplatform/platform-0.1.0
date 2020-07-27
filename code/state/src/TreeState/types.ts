import { Observable } from 'rxjs';

import * as t from '../common/types';

type Node = t.ITreeNode;
type O = Record<string, unknown>;

export type TreeState = {
  create<T extends Node = Node>(args?: ITreeStateArgs<T>): ITreeState<T>;
  identity: t.TreeIdentity;
  isInstance(input: any): boolean;
  children<T extends Node>(of: T, fn?: (children: T[]) => void): T[];
  props<P extends O>(of: Node, fn?: (props: P) => void): P;
};

export type ITreeStateArgs<T extends Node = Node> = {
  parent?: string; // ID of parent within tree.
  root?: T | string;
  dispose$?: Observable<any>;
};

/**
 * State machine for programming a tree,
 * or partial leaf within a tree.
 */
export type ITreeState<T extends Node = Node> = t.IDisposable & {
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

export type ITreeStateEvents<T extends Node = Node> = {
  readonly $: Observable<TreeStateEvent>;
  readonly changed$: Observable<ITreeStateChanged<T>>;
  payload<E extends t.TreeStateEvent>(type: E['type']): Observable<E['payload']>;
};

/**
 * Add
 */
export type TreeStateAdd = <T extends Node = Node>(args: TreeStateAddArgs<T>) => ITreeState<T>;
export type TreeStateAddArgs<T extends Node = Node> = {
  parent?: string;
  root: T | string | ITreeState<T>;
};

/**
 * Change
 */
export type TreeStateChange<T extends Node = Node> = (
  fn: TreeStateChanger<T>,
  options?: TreeStateChangeOptions,
) => TreeStateChangeResponse<T>;
export type TreeStateChangeResponse<T extends Node = Node> = t.IStateObjectChangeResponse<T>;
export type TreeStateChangeOptions = { silent?: boolean };
export type TreeStateChanger<T extends Node = Node> = (
  root: T,
  ctx: TreeStateChangerContext<T>,
) => void;
export type TreeStateChangerContext<T extends Node = Node> = t.ITreeQuery<T> & {
  children<C extends T>(of: C, fn?: (children: C[]) => void): C[];
  props<P extends NonNullable<T['props']>>(of: Node, fn?: (props: P) => void): P;
};

/**
 * Find
 */
export type TreeStateFind<T extends Node = Node> = (
  match: TreeStateFindMatch<T>,
) => t.ITreeState<T> | undefined;
export type TreeStateFindMatch<T extends Node> = (args: TreeStateFindMatchArgs<T>) => boolean;
export type TreeStateFindMatchArgs<T extends Node = Node> = {
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
export type ITreeStateChangedEvent<T extends Node = Node> = {
  type: 'TreeState/changed';
  payload: ITreeStateChanged<T>;
};
export type ITreeStateChanged<T extends Node = Node> = t.IStateObjectChanged<T>;

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
export type ITreeStateDisposedEvent<T extends Node = Node> = {
  type: 'TreeState/disposed';
  payload: ITreeStateDisposed<T>;
};
export type ITreeStateDisposed<T extends Node = Node> = { final: T };
