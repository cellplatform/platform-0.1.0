import React from 'react';

import { SAMPLE } from '../../DEV.Sample.data';
import { Doc } from '../../Doc';
import { t } from '../common';
import { DevSample as DevSampleDiagram } from '../../Diagram.TalkingDiagram/dev/DEV.Sample';

const routes: t.RouteTable = {
  /**
   * HOME
   */
  '/'(e) {
    console.log('render "HOME":', e);
    return e.render(<div>{`TODO: Index 🐷`}</div>);
  },

  /**
   * DOCUMENT: "/<path>/doc:<name>"
   */
  '/:path/doc\\::name*'(e) {
    const path = e.url.path;
    const def = SAMPLE.defs.find((def) => def.path === path);
    if (!def) return;

    console.log('render "doc:"', e);

    /**
     * TODO 🐷
     * - async renderer (show spinner, timeout)
     *
     */

    const blocks = Doc.toBlockElements({ def, width: e.size.width });
    e.render(<Doc.Layout blocks={blocks} style={{ flex: 1 }} />);
  },

  /**
   * DIAGRAM: "<path>/diagram:<name>"
   */
  '/:path/diagram\\::name*'(e) {
    console.log('render "DIAGRAM":', e);
    return e.render(<DevSampleDiagram style={{ flex: 1 }} />);
  },
};

/**
 * [Export]
 */
export const DevRouteTable = {
  routes,
};
