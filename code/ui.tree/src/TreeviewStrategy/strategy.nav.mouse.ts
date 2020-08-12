import { filter } from 'rxjs/operators';

import { t } from '../common';
import * as util from './util';

/**
 * Strategy for navigating around a tree.
 */
export const mouse: t.TreeviewStrategyMouseNavigation = (args) => {
  const { tree, events, mutate, strategy } = util.args(args);

  const get = util.get(tree);
  const query = get.query;

  const setCurrent = (id?: string) => {
    mutate.current(id);
    mutate.selected(get.children(id)[0]?.id);
  };

  /**
   * EVENTS: Left mouse button.
   */
  const left = events.mouse('LEFT');

  /**
   * BEHAVIOR: Set as selected when node is single-clicked.
   */
  left.down.node$.subscribe((e) => mutate.selected(e.id));

  /**
   * BEHAVIOR: Step up to parent when the "back" button is
   *           single-clicked on the panel header.
   */
  left.down.parent$.subscribe((e) => {
    const parent = query.parent(e.node);
    setCurrent(parent?.id);
  });

  /**
   * BEHAVIOR: Navigate into child when the "drill in chevron"
   *           is single-clicked.
   */
  left.down.drillIn$.subscribe((e) => setCurrent(e.id));

  /**
   * BEHAVIOR: Toggle open/closed an inline node when
   *           it's "twisty" is single-clicked.
   */
  left.down.twisty$
    .pipe(
      filter((e) => Boolean((e.props || {}).inline)),
      filter((e) => (e.children || []).length > 0),
    )
    .subscribe((e) => mutate.toggleOpen(e.id));

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
    .subscribe((e) => setCurrent(e.id));

  /**
   * BEHAVIOR: Toggle open/closed an inline node when
   *           it's double-clicked.
   */
  dblClickNodeWithChildren$
    .pipe(filter((e) => Boolean((e.props || {}).inline)))
    .subscribe((e) => mutate.toggleOpen(e.id));

  return strategy;
};
