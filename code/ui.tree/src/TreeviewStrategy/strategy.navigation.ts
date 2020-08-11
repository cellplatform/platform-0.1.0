import { filter } from 'rxjs/operators';

import { t } from '../common';
import { prepare, getParent } from './util';

/**
 * Strategy for navigating around a tree.
 */
export const navigation: t.TreeviewStrategyNavigation = (ctx, disposable) => {
  return {
    listen(event$, until$) {
      const { api, events, mutate } = prepare({ ctx, disposable, event$, until$ });

      /**
       * EVENTS: Left mouse button.
       */
      const left = events.mouse('LEFT');

      /**
       * BEHAVIOR: Step up to parent when the "back" button is
       *           single-clicked on the panel header.
       */
      left.down.parent$.subscribe((e) => mutate.current(getParent(ctx, e.node)?.id));

      /**
       * BEHAVIOR: Navigate into child when the "drill in chevron"
       *           is single-clicked.
       */
      left.down.drillIn$.subscribe((e) => mutate.current(e.id));

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
        .subscribe((e) => mutate.current(e.id));

      /**
       * BEHAVIOR: Toggle open/closed an inline node when
       *           it's double-clicked.
       */
      dblClickNodeWithChildren$
        .pipe(filter((e) => Boolean((e.props || {}).inline)))
        .subscribe((e) => mutate.toggleOpen(e.id));

      return api;
    },
  };
};
