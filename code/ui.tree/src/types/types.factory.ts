import { t, IIcon } from './common';

type N = t.ITreeViewNode;

/**
 * Factory renderer of an icon.
 */
export type RenderTreeIcon<T extends N = N> = (
  args: RenderTreeIconArgs<T>,
) => RenderTreeIconResponse;
export type RenderTreeIconResponse = IIcon | undefined;
export type RenderTreeIconArgs<T extends N = N> = {
  icon: string; // Identifier of the icon.
  node: T;
};

/**
 * Factory renderer of the body content of a tree-node.
 * Return:
 *  - Element:      The component to render.
 *  - [null]:       Render default label.
 *  - [undefined]:  Render default label.
 */
export type RenderTreeNodeBody<T extends N = N> = (
  args: RenderTreeNodeBodyArgs<T>,
) => RenderTreeNodeBodyResponse;
export type RenderTreeNodeBodyResponse = React.ReactNode | null | undefined;
export type RenderTreeNodeBodyArgs<T extends N = N> = {
  body: string;
  node: T;
  isFocused: boolean;
};

/**
 * Factory renderer of a custom panel within the tree.
 * Return:
 *  - Element:      The component to render.
 *  - [null]:       Render nothing.
 *  - [undefined]:  Render default list.
 */
export type RenderTreePanel<T extends N = N> = (
  args: RenderTreePanelArgs<T>,
) => RenderTreePanelResponse;
export type RenderTreePanelResponse = React.ReactNode | null | undefined;
export type RenderTreePanelArgs<T extends N = N> = {
  node: T;
  depth: number; // 0-based.
  isInline: boolean;
};

/**
 * Icon
 */
export type TreeNodeIcon =
  | string // String is an ID passed to `renderIcon` factory.
  | null; //  Placeholder, no icon shown, but space taken up.

/**
 * Node Path
 */
export type TreeNodePathFactory<T extends N = N> = (
  id: T['id'],
  context: ITreeNodePathContext,
) => T | undefined;
export type ITreeNodePathContext = { id: string; path: string; level: number };
