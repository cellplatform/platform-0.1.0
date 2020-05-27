import { TreeView } from '@platform/ui.tree';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { COLORS, t } from '../common';

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx, store } = args;
  const tree = TreeView.events(ctx.env.event$ as Observable<t.TreeViewEvent>);
  const left = tree.mouse({ button: 'LEFT' });

  /**
   * Change selection
   * - Update tree state.
   * - Request a new [View] to render.
   */
  left.click.node$.pipe(filter((e) => e.id !== store.state.tree.selected)).subscribe((e) => {
    const state = store.state;
    const root = toggleSelection(state.tree.root, e.id);
    ctx.dispatch({ type: 'FINDER/tree', payload: { root, selected: e.id } });
  });

  /**
   * REDUCER: Update tree state.
   */
  store.on<t.IFinderTreeEvent>('FINDER/tree').subscribe((e) => {
    const state = e.state;
    const tree = state.tree;

    const changeOrRemove = <K extends keyof t.IFinderState['tree']>(
      key: K,
    ): t.IFinderState['tree'][K] => {
      const from = tree[key];
      const to = e.payload[key];
      return (to === null ? undefined : to || from) as t.IFinderState['tree'][K];
    };

    const next = {
      ...state,
      tree: {
        ...tree,
        root: changeOrRemove('root'),
        current: changeOrRemove('current'),
        selected: changeOrRemove('selected'),
        theme: changeOrRemove('theme'),
      },
    };
    e.change(next);
  });
}

/**
 * [Helpers]
 */

function toggleSelection(root: t.ITreeNode | undefined, id: string) {
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
