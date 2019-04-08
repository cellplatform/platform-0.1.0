import { TreeNodeMouseEvent } from '../TreeNode';

/**
 * [Events]
 */
export type TreeViewEvent = ITreeViewMouseEvent;

export type ITreeViewMouseEvent = {
  type: 'TREEVIEW/mouse';
  payload: TreeNodeMouseEvent;
};
