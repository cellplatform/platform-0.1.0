import * as t from '../common/types';

type Node = t.ITreeviewNode;
type P = t.ITreeviewNodeProps;

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export type TreeviewState = {
  create<N extends Node = Node>(args?: t.ITreeStateArgs<N>): t.ITreeState<N>;

  /**
   * Common [TreeState] helpers.
   */
  identity: t.TreeState['identity'];
  isInstance: t.TreeState['isInstance'];
  children<T extends Node>(of: T, fn?: (children: T[]) => void): T[];
  props(of: Node, fn?: (props: P) => void): P;
};

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export type ITreeviewState<T extends Node = Node> = t.ITreeState<T>;
