import React from 'react';

import { SAMPLE } from '../../DEV.Sample.DATA';
import { Doc } from '../../Doc';
import { COLORS, t, time, css, DEFAULT } from '../common';
import { DevSample as DevSampleDiagram } from '../../Diagram.TalkingDiagram/dev/DEV.Sample';
import { RouteView } from '../RouteView';

type Milliseconds = number;

type Ctx = { theme?: t.RouteViewTheme; delay: Milliseconds };

export function DevRouteTable(getCtx: () => Ctx) {
  const Center: React.FC<{ children?: React.ReactNode }> = (props) => {
    const ctx = getCtx();
    const theme = ctx.theme ?? DEFAULT.THEME;
    const color = theme === 'Dark' ? COLORS.WHITE : COLORS.DARK;
    const style = css({ flex: 1, Flex: 'center-center', color });
    return <div {...style}>{props.children}</div>;
  };

  const NoMatch: React.FC<{ path: string }> = (props) => {
    return <Center>{`No Match 🐷 ${props.path}`}</Center>;
  };

  const routes: t.RouteTableDefs = {
    /**
     * HOME
     */
    '/'(e) {
      return e.render(<Center>{`TODO: Index 🐷`}</Center>);
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
      if (params.name === 'strategy-1') {
        await time.wait(ctx.delay);
        return e.render(<Center>{`Done 🌼`}</Center>);
      }

      /**
       * Sample 2
       *  - Manually insert the default loader.
       *  - Re-render the final content.
       */
      if (params.name === 'strategy-2') {
        e.render(<RouteView.LoadMask theme={ctx.theme} tile={false} style={{ Absolute: 0 }} />);
        time.wait(ctx.delay).then(() => e.render(<Center>{`Done 🌼`}</Center>));
        return;
      }

      /**
       * Sample 3
       */
      if (params.name === 'strategy-3') {
        e.render(<Center>{`Customer loading view...🚀`}</Center>);
        time.wait(ctx.delay).then(() => e.render(<Center>{`Done 🌼`}</Center>));
        return;
      }

      // 404 - No Match.
      e.render(<NoMatch path={e.url.path} />);
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

      // 404 - No Match.
      e.render(<NoMatch path={e.url.path} />);
    },

    /**
     * Media
     */
    '/media/image\\::ref'(e) {
      type T = { ref: string };
      const params = e.url.params as T;

      const href = {
        'unsplash-1':
          'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2971&q=80',
        'unsplash-2':
          'https://images.unsplash.com/photo-1583030225577-329fe6cc80d6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1530&q=80',
        'unsplash-3':
          'https://images.unsplash.com/photo-1654263391025-4c4809a37f5c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2564&q=80',
        'unsplash-4':
          'https://images.unsplash.com/photo-1511798616182-aab3698ac53e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2176&q=80',
      };

      const renderUnsplash = (ref: string) => {
        const styles = {
          base: css({
            flex: 1,
            backgroundImage: `url(${href[ref]})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
          }),
        };
        e.render(<div {...styles.base} />);
      };

      if (params.ref.startsWith('unsplash-')) {
        return renderUnsplash(params.ref);
      }

      // 404 - No Match.
      e.render(<NoMatch path={e.url.path} />);
    },
  };

  return routes;
}
