import * as themes from '../../themes';
import { t, Mouse } from '../../../common';
import { TreeUtil } from '../../TreeUtil';

/**
 * [Exports]
 */
export { themes };
export * from '../../common';
export { TreeUtil };
export { Icons, IIcon } from '../Icons';

/**
 * [Constants]
 */
export const DEFAULT = {
  PADDING: [5, 0, 5, 5] as t.CssEdgesInput,
};
export const SIZE = {
  LABEL: 24,
  ICON_LEFT: 18,
  ICON_RIGHT: 24,
  TWISTY_ICON: 16,
  TWISTY_WIDTH: 18,
};
export const MARGIN = {
  LABEL_LEFT: 4,
  LABEL_RIGHT: 8,
};

/**
 * [Helpers]
 */

/**
 * The ID that identifies the node within the DOM.
 */
export function toElementId(nodeId: string, rootId?: string) {
  const id = rootId ? `${rootId}:${nodeId}` : nodeId;
  return `TreeView:${id}`;
}

export function mouseHandlers(
  target: t.TreeNodeMouseEventHandlerArgs['target'],
  getNode: () => t.ITreeviewNode,
  onMouse?: t.TreeNodeMouseEventHandler,
) {
  const handlers = Mouse.handlers((e) => {
    const node = getNode();
    const props = node.props?.treeview || {};
    const children = TreeUtil.children(node);
    if (onMouse) {
      e.cancel(); // NB: Cancelling the mouse event prevent bubbling up, where a child node causes the parent node to also fire.
      onMouse({ ...e, id: node.id, target, node, props, children });
    }
  });
  type Handler = React.MouseEventHandler;
  const events = handlers.events;
  const onClick = events.onClick as Handler;
  const onDoubleClick = events.onDoubleClick as Handler;
  const onMouseDown = events.onMouseDown as Handler;
  const onMouseUp = events.onMouseUp as Handler;
  const onMouseEnter = events.onMouseEnter as Handler;
  const onMouseLeave = events.onMouseLeave as Handler;
  return { onClick, onDoubleClick, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave };
}
