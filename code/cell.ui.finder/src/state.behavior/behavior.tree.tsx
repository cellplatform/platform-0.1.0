import { TreeView } from '@platform/ui.tree';
import { Observable } from 'rxjs';

import { t } from '../common';

export function tree(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx, store } = args;
  const tree = TreeView.events(ctx.env.event$ as Observable<t.TreeViewEvent>);

  const left = tree.mouse({ button: 'LEFT' });
  left.click.node$.subscribe((e) => {
    console.log('tree: e.id', e.id);
  });

  /**
   * REDUCER: Update tree state.
   */
  store.on<t.IFinderTreeEvent>('FINDER/tree').subscribe((e) => {
    const state = e.state;
    const { root, current, theme } = e.payload;
    const next = {
      ...state,
      tree: {
        ...state.tree,
        root: root === null ? undefined : root || state.tree.root,
        current: current === null ? undefined : current || state.tree.current,
        theme: theme === null ? undefined : theme || state.tree.theme,
      },
    };
    e.change(next);
  });
}
