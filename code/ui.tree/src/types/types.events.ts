import { t } from './common';
import { MouseEvent } from '@platform/react';

type N = t.ITreeViewNode;

/**
 * [TreeView]
 */
export type TreeViewEvent = ITreeViewMouseEvent | ITreeViewFocusEvent;

/**
 * Mouse Event
 */
export type ITreeViewMouseEvent<T extends N = N> = {
  type: 'TREEVIEW/mouse';
  payload: t.ITreeViewMouse<T>;
};

export type TreeViewMouseTarget = 'NODE' | 'TWISTY' | 'DRILL_IN' | 'PARENT';
export type ITreeViewMouse<T extends N = N> = MouseEvent & {
  target: TreeViewMouseTarget;
  id: T['id'];
  node: T;
  props: t.ITreeViewNodeProps;
  children: T[];
};
export type TreeNodeMouseEventHandler = (e: ITreeViewMouse) => void;

/**
 * Focus
 */
export type ITreeViewFocusEvent = {
  type: 'TREEVIEW/focus';
  payload: ITreeViewFocus;
};
export type ITreeViewFocus = { isFocused: boolean };
