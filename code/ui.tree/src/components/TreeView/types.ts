import { TreeNodeMouseEvent } from '../TreeNode';

/**
 * [Events]
 */
export type TreeViewEvent = ITreeViewMouseEvent | ITreeViewFocusEvent;

export type ITreeViewMouseEvent = {
  type: 'TREEVIEW/mouse';
  payload: TreeNodeMouseEvent;
};

export type ITreeViewFocusEvent = {
  type: 'TREEVIEW/focus';
  payload: ITreeViewFocus;
};
export type ITreeViewFocus = { isFocused: boolean };
