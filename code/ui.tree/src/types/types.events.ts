import { t } from './common';
import { MouseEvent } from '@platform/react';

type N = t.ITreeViewNode;
export type TreeViewMouseTarget = 'NODE' | 'TWISTY' | 'DRILL_IN' | 'PARENT';

/**
 * Mouse Event
 */
export type TreeViewEvent = ITreeViewMouseEvent | ITreeViewFocusEvent | TreeViewRenderEvent;

/**
 * Mouse events fired as the pointer moves over
 * different parts of the tree.
 */
export type ITreeViewMouseEvent<T extends N = N> = {
  type: 'TREEVIEW/mouse';
  payload: t.ITreeViewMouse<T>;
};

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

/**
 * Render
 *
 * NB: This is a compliment to the 'render' factory functions
 *     passed into the <TreeView> component, providing a way for
 *     render requests to be fulfilled further afield than call-sites
 *     that can hand a factory to <TreeView>.
 *
 *     Following the "closest in the cascade wins" pattern, any explicit
 *     factory methods given to the <TreeView> will be used in preference
 *     to any event based factory/render requests.  Only if an explicitly
 *     passed factory does not yeild a result will the events be fired.
 */

export type TreeViewRenderEvent =
  | ITreeViewRenderIconEvent
  | ITreeViewRenderNodeBodyEvent
  | ITreeViewRenderPanelEvent
  | ITreeViewRenderHeaderEvent;

export type ITreeViewRenderIconEvent<T extends N = N> = {
  type: 'TREEVIEW/render/icon';
  payload: ITreeViewRenderIcon<T>;
};
export type ITreeViewRenderIcon<T extends N = N> = t.RenderTreeIconArgs<T> & {
  isHandled: boolean;
  render(el: t.RenderTreeIconResponse): void;
};

export type ITreeViewRenderNodeBodyEvent<T extends N = N> = {
  type: 'TREEVIEW/render/nodeBody';
  payload: ITreeViewRenderNodeBody<T>;
};
export type ITreeViewRenderNodeBody<T extends N = N> = t.RenderTreeNodeBodyArgs<T> & {
  isHandled: boolean;
  render(el: t.RenderTreeNodeBodyResponse): void;
};

export type ITreeViewRenderPanelEvent<T extends N = N> = {
  type: 'TREEVIEW/render/panel';
  payload: ITreeViewRenderPanel<T>;
};
export type ITreeViewRenderPanel<T extends N = N> = t.RenderTreePanelArgs<T> & {
  isHandled: boolean;
  render(el: t.RenderTreePanelResponse): void;
};

export type ITreeViewRenderHeaderEvent<T extends N = N> = {
  type: 'TREEVIEW/render/header';
  payload: ITreeViewRenderHeader<T>;
};
export type ITreeViewRenderHeader<T extends N = N> = t.RenderTreeHeaderArgs<T> & {
  isHandled: boolean;
  render(el: t.RenderTreeHeaderResponse): void;
};
