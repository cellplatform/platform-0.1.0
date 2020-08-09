import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { filter } from 'rxjs/operators';

import { t } from '../common';
import { TreeEvents } from '../TreeEvents';
import * as mutation from '../TreeViewNavigation/TreeviewNavigationMutation';

/**
 * Strategy for changing selectino based on mouse input.
 */
export const selection: t.TreeViewNavigationStrategy = (nav) => {
  const events = TreeEvents.create(nav.treeview$, nav.dispose$);
  const mutate = mutation.create(nav);

  type N = t.NodeIdentifier;
  const query = () => TreeQuery.create(nav.root);
  const getParent = (node: N) =>
    query().ancestor(node, (e) => e.level > 0 && !e.node.props?.treeview?.inline);

  /**
   * Left mouse button handlers.
   */
  const left = events.mouse({ button: ['LEFT'] });

  left.down.node$.subscribe((e) => mutate.selected(e.id));

  left.down.parent$.subscribe((e) => mutate.current(getParent(e.node)?.id));

  left.down.drillIn$.subscribe((e) => mutate.current(e.id));

  left.down.twisty$
    .pipe(
      filter((e) => Boolean((e.props || {}).inline)),
      filter((e) => (e.children || []).length > 0),
    )
    .subscribe((e) => mutate.toggleOpen(e.id));

  const dblClickNodeWithChildren$ = left.dblclick.node$.pipe(
    filter((e) => (e.children || []).length > 0),
  );

  dblClickNodeWithChildren$
    .pipe(filter((e) => !(e.props || {}).inline))
    .subscribe((e) => mutate.current(e.id));

  dblClickNodeWithChildren$
    .pipe(filter((e) => Boolean((e.props || {}).inline)))
    .subscribe((e) => mutate.toggleOpen(e.id));
};
