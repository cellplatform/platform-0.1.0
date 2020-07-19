import { t } from './common';

export * from './imports';
export * from './types.traverse';
export * from './types.factory';
export * from './types.props';

type O = Record<string, unknown>;

/**
 * A single node within the "tree"
 * (which is itself the root of a further branching tree).
 */
export type ITreeNode<T extends string = string, D extends O = any> = {
  id: T;
  props?: t.ITreeNodeProps;
  children?: Array<ITreeNode<T, D>>;
  data?: D; // Data associated with the node - not used by the tree itself.
  version?: number | string;
};
