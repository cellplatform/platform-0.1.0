import { ITreeNode } from '@platform/state/lib/types';

import { t } from './common';

type O = Record<string, unknown>;
type P = ITreeViewNodePropsContainer;

/**
 * A single node within a <TreeView>
 * (which is itself the root of a further branching tree).
 */
export type ITreeViewNode<D extends O = any> = ITreeNode<P> & {
  children?: ITreeViewNode<D>[];
  data?: D; // Data attached to the node (NB: not used by the <TreeView> itself).
};

export type ITreeViewNodePropsContainer = {
  treeview?: t.ITreeViewNodeProps;
};
