import { TreeView } from '@platform/ui.tree';
import { t } from '../common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx, store } = args;

  const tree = TreeView.events(ctx.event$ as Observable<t.TreeViewEvent>);
  const left = tree.mouse({ button: 'LEFT' });

  const toggleTwisty = (id: string) => {
    const root = TreeView.util.toggleIsOpen(store.state.tree.root, id);
    ctx.fire({ type: 'FINDER/tree', payload: { root } });
  };

  /**
   * Change selection
   *  - Update tree state.
   */
  left.down.node$.pipe(filter((e) => e.id !== store.state.tree.selected)).subscribe((e) => {
    ctx.fire({ type: 'FINDER/tree/select', payload: { node: e.id } });
  });

  /**
   * Toggle open/closed state of twisty.
   */
  left.down.twisty$.subscribe((e) => toggleTwisty(e.id));
  left.dblclick.node$
    .pipe(filter((e) => Boolean(e.props.inline)))
    .subscribe((e) => toggleTwisty(e.id));

  /**
   * Back button (header).
   */
  left.down.parent$.subscribe((e) => {
    const node = e.id;
    ctx.fire({ type: 'FINDER/tree/select', payload: { node } });
  });

  /**
   * Drill-in
   */
  left.down.drillIn$.subscribe((e) => {
    const node = e.children[0]?.id;
    if (node) {
      ctx.fire({ type: 'FINDER/tree/select', payload: { node } });
    }
  });
}
