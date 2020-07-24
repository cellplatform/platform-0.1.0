import { t } from './common';

type O = Record<string, unknown>;

/**
 * An identifiable "node" object.
 */
export type INode<P extends O = O> = { id: string; props?: P };
export type NodeIdentifier<T extends INode = INode> = T | T['id'];

/**
 * An "node" with [props] and [children]
 */
export type ITreeNode<P extends O = O> = INode<P> & {
  children?: ITreeNode[];
};

/**
 * A single node within a <TreeView>
 * (which is itself the root of a further branching tree).
 */
export type ITreeViewNode<D extends O = any> = ITreeNode<t.ITreeNodeProps> & {
  children?: ITreeViewNode<D>[];
  data?: D; // Data attached to the node (NB: not used by the <TreeView> itself).
};
