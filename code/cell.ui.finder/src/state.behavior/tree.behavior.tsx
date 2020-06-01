import { TreeView, TreeUtil } from '@platform/ui.tree';
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

  const toggleTwisty = (node: string) => {
    const root = TreeUtil.toggleIsOpen(store.state.tree.root, node);
    ctx.fire({ type: 'FINDER/tree', payload: { root } });
  };

  const select = (node?: string) => {
    if (node) {
      ctx.fire({ type: 'FINDER/tree/select', payload: { node } });
    }
  };

  /**
   * Change selection
   *  - Update tree state.
   */
  left.down.node$.pipe(filter((e) => e.id !== store.state.tree.selected)).subscribe((e) => {
    select(e.id);
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
    select(e.id);
  });

  /**
   * Drill-in
   */
  const drillIn = (node?: t.ITreeNode) => {
    const child = (node?.children || [])[0]?.id;
    select(child);
  };

  left.down.drillIn$.subscribe((e) => drillIn(e));
  left.dblclick.node$
    .pipe(
      filter((e) => !Boolean(e.props.inline)),
      filter((e) => e.children.length > 0),
    )
    .subscribe((e) => drillIn(e));
}
