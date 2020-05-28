import { TreeView } from '@platform/ui.tree';
import { COLORS, t } from '../common';

const util = TreeView.util;

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { store: t.IFinderStore }) {
  const { store } = args;

  /**
   * EPIC: Select the given node.
   */
  store.on<t.IFinderTreeSelectEvent>('FINDER/tree/select').subscribe((e) => {
    const selected = e.payload.node;
    const root = toggleSelection(e.state.tree.root, selected);
    const parent = util.parent(root, selected);
    const depth = util.depth(root, parent);
    const current = depth < 2 ? root?.id : parent?.id;
    store.dispatch({ type: 'FINDER/tree', payload: { root, selected, current } });
  });

  /**
   * EPIC: Select the given nodes parent.
   */
  store.on<t.IFinderTreeSelectParentEvent>('FINDER/tree/select/parent').subscribe((e) => {
    const root = e.state.tree.root;
    const parent = util.parent(root, e.payload.node);
    if (parent) {
      store.dispatch({ type: 'FINDER/tree/select', payload: { node: parent.id } });
    }
  });
}

/**
 * [Helpers]
 */

export function toggleSelection(root: t.ITreeNode | undefined, id: string) {
  const { BLUE } = COLORS;

  const current = util.find(root, (node) => node.props?.isSelected || false);
  if (current && current.id !== id) {
    root = util.setProps(root, current.id, {
      isSelected: false,
      colors: {},
    });
  }

  root = util.setProps(root, id, {
    isSelected: true,
    colors: { label: BLUE, icon: BLUE },
  });

  return root;
}
