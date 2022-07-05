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
          lineHeight: 1.8,
          color: COLORS.DARK,
          Flex: 'center-center',
        }),
      };

      const elLinks = SAMPLE.defs.map((def, i) => {
        const path = def.path;

        const handleClick = (mouse: React.MouseEvent) => {
          mouse.preventDefault();
          e.change({ path });
        };

        return (
          <li key={`${i}.${path}`}>
            <a href={path} onClick={handleClick}>
              <Button>{path}</Button>
            </a>
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
     * DOCUMENT: "/<path>/<name>"
     */
    '/docs/:path/:name*'(e) {
      const path = e.url.path;
      const def = SAMPLE.defs.find((def) => def.path === path);
      if (!def) return;

      e.render(<Doc.Layout def={def} style={{ flex: 1 }} />);
    },
  };
}
