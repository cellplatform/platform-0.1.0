import { filter } from 'rxjs/operators';

import { t } from '../common';
import * as util from './util';
import { Subject } from '../common/types';

/**
 * Strategy for navigating around a tree.
 */
export const mouse: t.TreeviewStrategyMouseNavigation = () => {
  const { events, treeview$ } = util.options();

  let tree: t.ITreeState;
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

  const setCurrent$ = new Subject<string>();
  setCurrent$.subscribe((id) => {
    const { get, mutate } = current();
    mutate.current(id);
    mutate.selected(get.children(id)[0]?.id);
  });

  /**
   * EVENTS: Left mouse button.
   */
  const left = events.mouse('LEFT');

  /**
   * BEHAVIOR: Set as selected when node is single-clicked.
   */
  left.down.node$.subscribe((e) => current().mutate.selected(e.id));

  /**
   * BEHAVIOR: Step up to parent when the "back" button is
   *           single-clicked on the panel header.
   */
  left.down.parent$.subscribe((e) => {
    const { query } = current();
    const parent = query.parent(e.node);
    setCurrent$.next(parent?.id);
  });

  /**
   * BEHAVIOR: Navigate into child when the "drill in chevron"
   *           is single-clicked.
   */
  left.down.drillIn$.subscribe((e) => setCurrent$.next(e.id));

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
    .subscribe((e) => setCurrent$.next(e.id));

  /**
   * BEHAVIOR: Toggle open/closed an inline node when
   *           it's double-clicked.
   */
  dblClickNodeWithChildren$
    .pipe(filter((e) => Boolean((e.props || {}).inline)))
    .subscribe((e) => current().mutate.toggleOpen(e.id));

  return strategy;
};
