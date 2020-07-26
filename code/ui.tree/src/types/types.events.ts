import { t } from './common';
import { MouseEvent } from '@platform/react';

type N = t.ITreeViewNode;

/**
 * [TreeView]
 */
export type TreeViewEvent = ITreeViewMouseEvent | ITreeViewFocusEvent | ITreeViewRenderingNodeEvent;

export type ITreeViewRenderingNodeEvent<T extends N = N> = {
  type: 'TREEVIEW/rendering/node';
  payload: ITreeViewRenderingNode<T>;
};
export type ITreeViewRenderingNode<T extends N = N> = {
  node: T;
};

/**
 * Mouse Event
 */
export type ITreeViewMouseEvent<T extends N = N> = {
  type: 'TREEVIEW/mouse';
  payload: t.TreeViewMouse<T>;
};

export type TreeViewMouseTarget = 'NODE' | 'TWISTY' | 'DRILL_IN' | 'PARENT';
export type TreeViewMouse<T extends N = N> = MouseEvent & {
  target: TreeViewMouseTarget;
  id: T['id'];
  node: T;
  props: t.ITreeNodeProps;
  children: T[];
};
export type TreeNodeMouseEventHandler = (e: TreeViewMouse) => void;

/**
 * Focus
 */
export type ITreeViewFocusEvent = {
  type: 'TREEVIEW/focus';
  payload: ITreeViewFocus;
};
export type ITreeViewFocus = { isFocused: boolean };
