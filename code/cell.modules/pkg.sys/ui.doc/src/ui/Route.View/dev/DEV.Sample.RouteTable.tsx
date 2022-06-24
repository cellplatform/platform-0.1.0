import React from 'react';

import { SAMPLE } from '../../DEV.Sample.data';
import { Doc } from '../../Doc';
import { COLORS, t, time, css, DEFAULT } from '../common';
import { DevSample as DevSampleDiagram } from '../../Diagram.TalkingDiagram/dev/DEV.Sample';
import { RouteView } from '../RouteView';

type Ctx = { theme?: t.RouteViewTheme };

export function DevRouteTable(getCtx: () => Ctx) {
  const Center: React.FC = (props) => {
    const ctx = getCtx();
    const theme = ctx.theme ?? DEFAULT.THEME;
    const color = theme === 'Dark' ? COLORS.WHITE : COLORS.DARK;
    const style = css({ flex: 1, Flex: 'center-center', color });
    return <div {...style}>{props.children}</div>;
  };

  const routes: t.RouteTableDefs = {
    /**
     * HOME
     */
    '/'(e) {
      return e.render(<Center>{`TODO: Index 🐷`}</Center>);
    },

    /**
     * DOCUMENT: "/<path>/doc:<name>"
     */
    '/:path/doc\\::name*'(e) {
      const path = e.url.path;
      const def = SAMPLE.defs.find((def) => def.path === path);
      if (!def) return;

      /**
       * TODO 🐷 Size
       */
      const width = 550; // TEMP 🐷
      const blocks = Doc.toBlockElements({ def, width });
      e.render(<Doc.Layout blocks={blocks} style={{ flex: 1 }} />);
    },

    /**
     * DIAGRAM: "<path>/diagram:<name>"
     */
    '/:path/diagram\\::name*'(e) {
      console.log('render "DIAGRAM":', e);
      e.render(<DevSampleDiagram style={{ flex: 1 }} />);
    },

    /**
     * Async loading (spinner) behavior tests.
     */
    async '/async/:name'(e) {
      type T = { name: string };
      const params = e.url.params as T;
      const ctx = getCtx();

      /**
       * Sample 1
       *  - Cause the handler to delay completing.
       *  - The container auto inserts a <Loading> view
       *  - The existing route is blurred behind the loader.
       */
      if (params.name === 'sample-1') {
        await time.wait(1500);
        return e.render(<Center>{`Ready 🌳`}</Center>);
      }

      /**
       * Sample 2
       *  - Manually insert the default loader.
       *  - Re-render the final content.
       */
      if (params.name === 'sample-2') {
        e.render(<RouteView.Loading theme={ctx.theme} />);
        time.wait(1500).then(() => e.render(<Center>{`Done 🌼`}</Center>));
        return;
      }

      /**
       * Sample 3
       */
      if (params.name === 'sample-3') {
        e.render(<Center>{`Customer loading view...🚀`}</Center>);
        time.wait(1500).then(() => e.render(<Center>{`Done 👋`}</Center>));
        return;
      }

      /**
       * No Match
       */
      e.render(<Center>{`No Match 🐷 ${e.url.path}`}</Center>);
    },

    /**
     * Component
     */
    '/component/:kind'(e) {
      type T = { kind: string };
      const params = e.url.params as T;

      if (params.kind === 'Doc.LayoutContainer') {
        e.render(<Doc.LayoutContainer style={{ flex: 1 }} debug={true} />);
        return;
      }

      /**
       * No Match
       */
      e.render(<Center>{`No Match 🐷 ${e.url.path}`}</Center>);
    },
  };

  return routes;
}
