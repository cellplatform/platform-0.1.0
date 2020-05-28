import * as React from 'react';
import { filter } from 'rxjs/operators';

import { rx, t } from '../common';

// const imports = {
//   file: import('../components/Viewer.File'),
//   doc: import('../components/Viewer.Doc'),
// };
// const URI_TEMP = 'cell:cka0c7a0i00004369o5ttdbt3:A1'; // TEMP 🐷

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
      // console.log('behavior', e);
      // const node = e.state.tree.selected;
      // console.log('node', node);
      // if (node === 'intro.files') {
      //   e.render(async () => {
      //     const Viewer = (await imports.file).Viewer;
      //     return <Viewer uri={URI_TEMP} />;
      //   });
      // } else {
      //   e.render(async () => {
      //     const Doc = (await imports.doc).Doc;
      //     return <Doc />;
      //   });
      // }
    });
}
