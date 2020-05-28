import { TreeView } from '@platform/ui.tree';
import { COLORS, t } from '../common';

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
    const root = toggleSelection(store.state.tree.root, selected);
    store.dispatch({ type: 'FINDER/tree', payload: { root, selected } });
  });
}

/**
 * [Helpers]
 */

export function toggleSelection(root: t.ITreeNode | undefined, id: string) {
  const { BLUE } = COLORS;

  const current = TreeView.util.find(root, (node) => node.props?.isSelected || false);
  if (current && current.id !== id) {
    root = TreeView.util.setProps(root, current.id, {
      isSelected: false,
      colors: {},
    });
  }

  root = TreeView.util.setProps(root, id, {
    isSelected: true,
    colors: { label: BLUE, icon: BLUE },
  });

  return root;
}
