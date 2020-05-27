import * as React from 'react';

import { t, rx } from '../common';
import { Viewer } from '../components/Viewer';
import { Doc } from '../components/Viewer.Doc';

const URI_TEMP = 'cell:cka0c7a0i00004369o5ttdbt3:A1'; // TEMP 🐷

export function view(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx } = args;
  // const event$ = ctx.env.event$;

  // rx.eventPayload<t.IFinderViewRenderEvent>(event$, 'FINDER/view/render').subscribe((e) => {
  //   const { node } = e;
  //   if (node === 'intro.files') {
  //     e.render(<Viewer uri={URI_TEMP} />);
  //   } else {
  //     e.render(<Doc />);
  //   }
  // });
}
