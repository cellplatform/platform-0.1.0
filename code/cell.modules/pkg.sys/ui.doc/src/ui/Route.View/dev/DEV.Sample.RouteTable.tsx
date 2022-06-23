import React from 'react';

import { SAMPLE } from '../../DEV.Sample.data';
import { Doc } from '../../Doc';
import { t, time, css } from '../common';
import { DevSample as DevSampleDiagram } from '../../Diagram.TalkingDiagram/dev/DEV.Sample';

const routes: t.RouteTableDefs = {
  /**
   * HOME
   */
  '/'(e) {
    console.log('render "HOME":', e);
    const styles = {
      base: css({ Flex: 'center-center', flex: 1 }),
    };
    return e.render(<div {...styles.base}>{`TODO: Index 🐷`}</div>);
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

    const width = 550; // TEMP 🐷
    const blocks = Doc.toBlockElements({ def, width });
    e.render(<Doc.Layout blocks={blocks} style={{ flex: 1 }} />);
  },

  /**
   * DIAGRAM: "<path>/diagram:<name>"
   */
  async '/:path/diagram\\::name*'(e) {
    console.log('render "DIAGRAM":', e);

    await time.wait(1500);
    return e.render(<DevSampleDiagram style={{ flex: 1 }} />);
  },
};

/**
 * [Export]
 */
export const DevRouteTable = {
  routes,
};
