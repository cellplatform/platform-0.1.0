import * as t from '../../common/types';

type Node = t.ITreeViewNode;

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export type TreeViewState = {
  create<N extends Node = Node>(args?: t.ITreeStateArgs<N>): t.ITreeState<N>;

  /**
   * Common [TreeState] helpers.
   */
  id: t.TreeState['identity'];
  isInstance: t.TreeState['isInstance'];
  children: t.TreeState['children'];
  props: t.TreeState['props'];
};

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export type ITreeViewState<T extends Node = Node> = t.ITreeState<T>;
