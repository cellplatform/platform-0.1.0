import { TreeIdentity } from '@platform/state';
import { filter } from 'rxjs/operators';

import { t } from '../common';
import * as util from './util';
import { Subject } from '../common/types';

/**
 * Strategy for navigating around a tree.
 */
export const mouse: t.TreeviewStrategyMouseNavigation = (args) => {
  const { events, treeview$ } = util.options();
  const { fire } = args;

  let tree: t.ITreeviewState;
  const strategy: t.ITreeviewStrategy = {
    /**
     * NB: The [tree] is stored temporarily so that the handlers below can be
     *     setup using just simple observable description, and the [tree]
     *     state is essentially beign "injected" in via this call prior to
     *     them running.
     */
    next(e) {
      tree = e.tree;
      treeview$.next(e.event);
    },
  };

  const current = () => util.current(tree);

  const select = (node?: t.NodeIdentifier) => {
    const selected = TreeIdentity.toNodeId(node);
    fire({ type: 'TREEVIEW/select', payload: { selected } });
  };

  const selection = (args: { selected?: t.NodeIdentifier; current?: t.NodeIdentifier }) => {
    const { get } = util.current(tree);
    const current = TreeIdentity.toNodeId(args.current);
    const selected = TreeIdentity.toNodeId(args.selected) || get.children(current)[0]?.id;
    fire({ type: 'TREEVIEW/select', payload: { selected, current } });
  };

  /**
   * EVENTS: Left mouse button.
   */
  const left = events.mouse('LEFT');

  /**
   * BEHAVIOR: Set as selected when node is single-clicked.
   */
  left.down.node$.subscribe((e) => select(e.id));

  /**
   * BEHAVIOR: Step up to parent when the "back" button is
   *           single-clicked on the panel header.
   */
  left.down.parent$.subscribe((e) => {
    const { query } = current();
    const parent = query.parent(e.node);
    selection({ current: parent?.id, selected: e.id });
  });

  /**
   * BEHAVIOR: Navigate into child when the "drill in chevron"
   *           is single-clicked.
   */
  left.down.drillIn$.subscribe((e) => selection({ current: e.id }));

  /**
   * BEHAVIOR: Toggle open/closed an inline node when
   *           it's "twisty" is single-clicked.
   */
  left.down.twisty$
    .pipe(
      filter((e) => Boolean((e.props || {}).inline)),
      filter((e) => (e.children || []).length > 0),
    )
    .subscribe((e) => current().mutate.toggleOpen(e.id));

  /**
   * EVENTS: Double-clicked node that has children.
   */
  const dblClickNodeWithChildren$ = left.dblclick.node$.pipe(
    filter((e) => (e.children || []).length > 0),
  );

  /**
   * BEHAVIOR: Navigate into child when a node is double-clicked.
   */
  dblClickNodeWithChildren$
    .pipe(filter((e) => !(e.props || {}).inline))
    .subscribe((e) => selection({ current: e.id }));

  /**
   * BEHAVIOR: Toggle open/closed an inline node when
   *           it's double-clicked.
   */
  dblClickNodeWithChildren$
    .pipe(filter((e) => Boolean((e.props || {}).inline)))
    .subscribe((e) => current().mutate.toggleOpen(e.id));

  return strategy;
};
