import { Treeview } from '@platform/ui.tree';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t } from '../../../common';

export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx, store } = args;

  const tree = Treeview.events(ctx.event$ as Observable<t.TreeviewEvent>);
  const left = tree.mouse({ button: ['LEFT'] });

  const toggleTwisty = (node: string) => {
    const root = Treeview.util.toggleIsOpen(store.state.tree.root, node);
    ctx.fire({ type: 'APP:FINDER/tree', payload: { root } });
  };

  const select = (node?: string) => {
    if (node) {
      ctx.fire({ type: 'APP:FINDER/tree/select', payload: { node } });
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
  const drillIn = (node?: t.ITreeviewNode) => {
    const child = (node?.children || [])[0]?.id;
    select(child);
  };

  left.down.drillIn$.subscribe((e) => drillIn(e as any)); // HACK: temp, this will get replaced with newer [TreeState] controllers
  left.dblclick.node$
    .pipe(
      filter((e) => !Boolean(e.props.inline)),
      filter((e) => e.children.length > 0),
    )
    .subscribe((e) => drillIn(e as any)); // HACK: temp, this will get replaced with newer [TreeState] controllers
}
