import { TreeView } from '@platform/ui.tree';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t } from '../common';
import { toggleSelection } from './behavior.tree.toggle';

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx, store } = args;
  const tree = TreeView.events(ctx.env.event$ as Observable<t.TreeViewEvent>);
  const left = tree.mouse({ button: 'LEFT' });

  const toggleTwisty = (id: string) => {
    const root = TreeView.util.toggleIsOpen(store.state.tree.root, id);
    ctx.dispatch({ type: 'FINDER/tree', payload: { root } });
  };

  /**
   * Change selection
   * - Update tree state.
   */
  left.click.node$.pipe(filter((e) => e.id !== store.state.tree.selected)).subscribe((e) => {
    const selected = e.id;
    const root = toggleSelection(store.state.tree.root, selected);
    ctx.dispatch({ type: 'FINDER/tree', payload: { root, selected } });
  });

  /**
   * Toggle open/closed state of twisty.
   */
  left.click.twisty$.subscribe((e) => toggleTwisty(e.id));
  left.dblclick.node$
    .pipe(filter((e) => Boolean(e.props.inline)))
    .subscribe((e) => toggleTwisty(e.id));

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
