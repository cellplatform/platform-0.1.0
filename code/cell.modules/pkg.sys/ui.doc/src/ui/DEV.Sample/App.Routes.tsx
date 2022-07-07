import React from 'react';
import { time, t, css, Color, COLORS, Button } from './common';
import { SAMPLE } from '../DEV.Sample.DATA';
import { Doc } from '../Doc';
import { Diagram } from '../Diagram';

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

      const toListItemElement = (path: string) => {
        const handleClick = (mouse: React.MouseEvent) => {
          mouse.preventDefault();
          e.change({ path });
        };

        return (
          <li key={path}>
            <a href={path} onClick={handleClick}>
              <Button>{path}</Button>
            </a>
          </li>
        );
      };

      const elLinks = SAMPLE.defs.map((def, i) => {
        return toListItemElement(def.path);
      });

      return e.render(
        <div {...styles.base}>
          <ul>
            {elLinks}
            {toListItemElement('/diagram')}
          </ul>
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
