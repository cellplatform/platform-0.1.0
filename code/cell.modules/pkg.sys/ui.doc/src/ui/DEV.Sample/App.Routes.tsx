import React from 'react';
import { t, css, Color, COLORS, Button } from './common';
import { SAMPLE } from '../DEV.Sample.data';
import { Doc } from '../Doc';

export function AppRoutes(): t.RouteTableDefs {
  return {
    '/'(e) {
      const styles = {
        base: css({
          Absolute: 0,
          Flex: 'center-center',
          lineHeight: 1.8,
        }),
      };

      const elLinks = SAMPLE.defs.map((def, i) => {
        const path = def.path;
        return (
          <li key={`${i}.${path}`}>
            <Button onClick={() => e.change({ path })}>{path}</Button>
          </li>
        );
      });

      return e.render(
        <div {...styles.base}>
          <ul>{elLinks}</ul>
        </div>,
      );
    },

    /**
     * DOCUMENT: "/<path>/doc:<name>"
     */
    '/:path/doc\\::name*'(e) {
      const path = e.url.path;
      const def = SAMPLE.defs.find((def) => def.path === path);
      if (!def) return;

      e.render(<Doc.Layout def={def} style={{ flex: 1 }} />);
    },
  };
}
