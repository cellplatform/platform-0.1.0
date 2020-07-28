import * as t from '../common/types';

type Node = t.ITreeViewNode;
type P = t.ITreeViewNodeProps;

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export type TreeViewState = {
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
export type ITreeViewState<T extends Node = Node> = t.ITreeState<T>;
