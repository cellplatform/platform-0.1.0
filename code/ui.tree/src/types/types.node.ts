import { ITreeNode } from '@platform/state/lib/types';
import { t } from './common';

type B = ITreeNodePropsTreeView;

/**
 * A single node within a <TreeView>
 * (which is itself the root of a further branching tree).
 */
export type ITreeViewNode<P extends B = B> = ITreeNode<P>;
export type ITreeNodePropsTreeView = { treeview?: t.ITreeViewNodeProps };
