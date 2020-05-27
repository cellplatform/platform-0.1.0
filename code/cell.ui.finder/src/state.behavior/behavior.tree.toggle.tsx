import { TreeView } from '@platform/ui.tree';
import { COLORS, t } from '../common';

/**
 * Toggles the selected node.
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

