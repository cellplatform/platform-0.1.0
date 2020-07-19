import { t } from './common';

export * from './imports';
export * from './types.traverse';
export * from './types.factory';
export * from './types.props';

type O = Record<string, unknown>;

/**
 * An identifiable "node" object.
 */
export type INode<T extends string = string> = { id: T };

/**
 * A single node within the "tree"
 * (which is itself the root of a further branching tree).
 */
export type ITreeNode<T extends string = string, D extends O = any> = INode<T> & {
  props?: t.ITreeNodeProps;
  children?: Array<ITreeNode<T, D>>;
  data?: D; // Data attached to the node (NB: not used by the <TreeView> itself).
};
