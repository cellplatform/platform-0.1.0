import React from 'react';

import { SAMPLE } from '../DEV.Sample.DATA';
import { Diagram } from '../Diagram';
import { Doc } from '../Doc';
import { Button, COLORS, css, t, time } from './common';

export function AppRoutes(): t.RouteTableDefs {
  return {
    '/'(e) {
      const items = SAMPLE.defs;
      const change = e.change;

      e.render(
        <Doc.Index
          items={items}
          style={{ flex: 1 }}
          onSelectItem={(e) => {
            const path = e.def.path;
            change({ path });
          }}
        />,
      );
    },

    /**
     * DOCUMENT: "/<path>/<name>"
     */
    '/docs/:path/:name*'(e) {
      const path = e.url.path;
      const def = SAMPLE.defs.find((def) => def.path === path);
      if (!def) return;

      e.render(<Doc.Layout doc={def} style={{ flex: 1 }} />);
    },

    /**
     * DIAGRAM
     */
    async '/diagram'(e) {
      await time.wait(400); // Sample spinner.
      e.render(<Diagram.TalkingDiagram style={{ flex: 1 }} />);
    },
  };
}
