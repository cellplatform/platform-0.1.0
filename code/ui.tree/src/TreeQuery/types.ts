import * as t from '../common/types';

type Node = t.ITreeNode;
type MaybeId<T extends Node> = t.NodeIdentifier<T> | undefined;

export type TreeQuery = {
  create<T extends Node = Node>(root: T | { root: T; namespace?: string }): ITreeQuery<T>;
  children: TreeChildren;
  hasChild: TreeHasChild;
};

/**
 * Interface for querying nodes within a tree.
 */
export type ITreeQuery<T extends Node = Node> = {
  root: T;
  namespace: string;
  walkDown: TreeWalkDown<T>;
  walkUp: TreeWalkUp<T>;
  find: TreeFind<T>;
  findById: TreeFindById<T>;
  exists: TreeNodeExists<T>;
  parent: TreeParent<T>;
  ancestor: TreeAncestor<T>;

  /**
   * TODO 🐷
   * - depth
   *
   * STATIC
   * - children
   * - childAt
   */
};

/**
 * Children
 */
export type TreeChildren = <T extends Node = Node>(
  of?: T,
  fn?: TreeChildrenVisitor<T> | TreeChildrenOptions,
  options?: TreeChildrenOptions,
) => T[];
export type TreeChildrenOptions = { assign?: boolean };
export type TreeChildrenVisitor<T extends Node> = (children: T[]) => void;
export type TreeHasChild = (parent?: Node, child?: t.NodeIdentifier) => boolean;

/**
 * Find
 */
export type TreeMatchDescend<T extends Node> = (args: ITreeDescend<T>) => boolean;
export type TreeMatchAscend<T extends Node> = (args: ITreeAscend<T>) => boolean;
export type TreeFind<T extends Node> = (match: TreeMatchDescend<T>) => T | undefined;
export type TreeFindById<T extends Node> = (id: MaybeId<T>) => T | undefined;
export type TreeNodeExists<T extends Node> = (input: MaybeId<T> | TreeMatchDescend<T>) => boolean;

/**
 * Walk Down/Up
 */
export type TreeWalkDown<T extends Node> = (visit: TreeWalkDownVisitor<T>) => void;
export type TreeWalkDownVisitor<T extends Node> = (args: ITreeDescend<T>) => void;

export type TreeWalkUp<T extends Node> = (startAt: MaybeId<T>, visit: TreeWalkUpVisitor<T>) => void;
export type TreeWalkUpVisitor<T extends Node> = (args: ITreeAscend<T>) => void;

/**
 * Ancestry
 */
export type TreeParent<T extends Node> = (
  node: MaybeId<T>,
  options?: { inline?: boolean },
) => T | undefined;

export type TreeAncestor<T extends Node> = (
  node: MaybeId<T>,
  match: TreeMatchAscend<T>,
) => T | undefined;

/**
 * Arguments for walking a tree (top-down).
 */
export type ITreeDescend<T extends Node = Node> = {
  id: string;
  namespace: string;
  index: number; // Within siblings.
  node: T;
  parent?: T;
  depth: number;
  stop(): void;
  skip(): void; // Skip children.
};

/**
 * Arguments for walking a tree (bottom up).
 */
export type ITreeAscend<T extends Node = Node> = {
  id: string;
  namespace: string;
  index: number; // Within siblings.
  node: T;
  parent?: T;
  stop(): void;
};
