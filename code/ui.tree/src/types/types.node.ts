import { ITreeNode } from '@platform/state/lib/types';
import { t } from './common';

type B = ITreeNodePropsTreeview;

/**
 * A single node within a <TreeView>
 * (which is itself the root of a further branching tree).
 */
export type ITreeviewNode<P extends B = B> = ITreeNode<P>;
export type ITreeNodePropsTreeview = { treeview?: t.ITreeviewNodeProps };
