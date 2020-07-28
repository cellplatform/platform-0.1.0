import { TreeUtil } from '@platform/ui.tree/lib/TreeUtil';
import { COLORS, t } from '../../../common';

export function init(args: { store: t.IAppStore }) {
  const { store } = args;

  /**
   * EPIC: Select the given node.
   */
  store.on<t.IFinderTreeSelectEvent>('APP:FINDER/tree/select').subscribe((e) => {
    const selected = e.payload.node;
    const root = toggleSelection(e.state.tree.root, selected);
    const query = TreeUtil.query(root);
    const parent = query.parent(selected);
    const depth = query.depth(parent);
    const current = depth < 2 ? root?.id : parent?.id;
    store.dispatch({ type: 'APP:FINDER/tree', payload: { root, selected, current } });
  });

  /**
   * EPIC: Select the given nodes parent.
   */
  store.on<t.IFinderTreeSelectParentEvent>('APP:FINDER/tree/select/parent').subscribe((e) => {
    const root = e.state.tree.root;
    const parent = TreeUtil.query(root).parent(e.payload.node);
    if (parent) {
      store.dispatch({ type: 'APP:FINDER/tree/select', payload: { node: parent.id } });
    }
  });
}

/**
 * [Helpers]
 */

export function toggleSelection(root: t.ITreeViewNode | undefined, id: string) {
  const { BLUE } = COLORS;

  const current = TreeUtil.query(root).find((e) => e.node.props?.treeview?.isSelected || false);
  if (current && current.id !== id) {
    root = TreeUtil.setProps(root, current.id, {
      isSelected: false,
      colors: {},
    });
  }

  root = TreeUtil.setProps(root, id, {
    isSelected: true,
    colors: { label: BLUE, icon: BLUE },
  });

  return root;
}
