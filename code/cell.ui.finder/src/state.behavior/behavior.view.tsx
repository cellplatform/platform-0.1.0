import * as React from 'react';
import { filter } from 'rxjs/operators';

import { rx, t, time } from '../common';
import { Viewer } from '../components/Viewer';
import { Doc } from '../components/Viewer.Doc';

const URI_TEMP = 'cell:cka0c7a0i00004369o5ttdbt3:A1'; // TEMP 🐷

/**
 * Behavior controller for the current [View].
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx } = args;
  const event$ = ctx.env.event$;

  /**
   * Listen for view requests and render view that maps to the currently selected tree-node.
   */
  rx.eventPayload<t.IFinderViewRequestEvent>(event$, 'FINDER/view/req')
    .pipe(filter((e) => !e.isHandled))
    .subscribe((e) => {
      const id = e.state.tree.selected;

      if (id === 'intro.files') {
        e.render(async () => {
          await time.wait(500); // Fake load delay.

          return <Viewer uri={URI_TEMP} />;
        });
      } else {
        e.render(<Doc />);
      }
    });
}
