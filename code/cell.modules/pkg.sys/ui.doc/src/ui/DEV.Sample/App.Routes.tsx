import React from 'react';

import { SAMPLE } from '../DEV.Sample.DATA';
import { Diagram } from '../Diagram';
import { Doc } from '../Doc';
import { css, t, time } from './common';
import { UpNav } from './ui/DEV.UpNav';

export function AppRoutes(): t.RouteTableDefs {
  return {
    '/'(e) {
      const items = SAMPLE.defs;
      const change = e.change;

      e.render(
        <Doc.Index
          items={items}
          style={{ flex: 1 }}
          onSelect={(e) => {
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

      const styles = {
        base: css({ flex: 1 }),
        layout: css({ Absolute: 0 }),
        nav: css({ Absolute: 0 }),
      };

      e.render(
        <div {...styles.base}>
          <Doc.Layout doc={def} style={styles.layout} />
          <UpNav style={styles.nav} onClick={() => e.change({ path: '/' })} />
        </div>,
      );
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
