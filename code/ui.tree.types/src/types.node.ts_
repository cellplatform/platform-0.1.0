import { ITreeNode } from '@platform/state.types';
import * as t from './types';

type B = ITreeNodePropsTreeview;

/**
 * A single node within a <TreeView>
 * (which is itself the root of a further branching tree).
 */
export type ITreeviewNode<P extends B = B> = ITreeNode<P>;
export type ITreeNodePropsTreeview = { treeview?: t.ITreeviewNodeProps };

/**
 * Icon
 */
export type TreeNodeIcon =
  | string // String is an ID passed to `renderIcon` factory.
  | null; //  Placeholder, no icon shown, but space taken up.
