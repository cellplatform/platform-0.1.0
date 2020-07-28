import { ITreeNode } from '@platform/state/lib/types';
import { t } from './common';

type BaseProps = ITreeViewNodePropsBase;

/**
 * A single node within a <TreeView>
 * (which is itself the root of a further branching tree).
 */
export type ITreeViewNode<P extends BaseProps = BaseProps> = ITreeNode<P>;
export type ITreeViewNodePropsBase = { treeview?: t.ITreeViewNodeProps };
