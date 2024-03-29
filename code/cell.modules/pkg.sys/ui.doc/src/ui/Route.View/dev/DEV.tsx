import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { RouteViewProps } from '..';
import { SAMPLE } from '../../DEV.Sample.DATA';
import { Route } from '../../Route';
import { COLORS, RouteBus, rx, t } from '../common';
import { DevRouteTable } from './DEV.Sample.RouteTable';

type Milliseconds = number;

type Ctx = {
  instance: t.RouteInstance;
  href: string;
  route: t.RouteEvents;
  props: RouteViewProps;
  debug: { delay: Milliseconds };
};

const Util = {
  debug(ctx: Ctx) {
    return ctx.props.debug || (ctx.props.debug = {});
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.Route.View')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const bus = rx.bus();
    const instance: t.RouteInstance = { bus, id: 'Route.View:dev' };

    const { getHref, pushState } = RouteBus.Dev.mock('https://domain.com/');
    const route = RouteBus.Controller({
      instance,
      getHref,
      pushState,
    });
    route.current.$.subscribe((e) => change.ctx((ctx) => (ctx.href = e.info.url.href)));

    const ctx: Ctx = {
      instance,
      route,
      href: route.current.url.href,
      props: {
        instance,
        routes: DevRouteTable(() => ({
          theme: e.current?.props.theme,
          delay: e.current?.debug.delay ?? ctx.debug.delay,
        })),
        theme: Route.View.DEFAULT.THEME,
        debug: { renderCount: true },
      },
      debug: { delay: 1500 },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Routes');

    const route = (path: string) => {
      const label = `url: ${path}`;
      e.button(label, (e) => e.ctx.route.change.fire({ path }));
    };

    route('/');

    e.hr(1, 0.1);
    e.markdown('type "Document": `ns/doc:name`');
    SAMPLE.defs.forEach((def) => route(def.path));

    e.hr(1, 0.1);
    e.markdown('type "Diagram": `ns/diagram:name`');
    route('/foo/diagram:sample-1');

    e.hr(1, 0.1);
    e.markdown('async/spinner sample programming strategies');
    route('/async/strategy-1');
    route('/async/strategy-2');
    route('/async/strategy-3');

    e.hr(1, 0.1);
    e.markdown('media samples');
    route('/media/image:unsplash-1');
    route('/media/image:unsplash-2');
    route('/media/image:unsplash-3');
    route('/media/image:unsplash-4');

    e.hr(1, 0.1);
    e.markdown('component samples');
    route('/component/Doc.LayoutContainer');

    e.hr(1, 0.1);

    e.markdown(
      `route path/token pattern [reference](https://github.com/pillarjs/path-to-regexp#readme)`,
    );

    e.hr();
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .view('buttons')
        .items(Route.View.DEFAULT.THEMES.map((value) => ({ label: `theme: ${value}`, value })))
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('debug.renderCount', (e) => {
      const debug = Util.debug(e.ctx);
      if (e.changing) debug.renderCount = e.changing.next;
      e.boolean.current = debug.renderCount;
    });

    e.select((config) => {
      const items = [0, 300, 1500, 5000];
      config
        .title('load delay')
        .items(items.map((value) => ({ label: `${value}ms`, value })))
        .initial(config.ctx.debug.delay)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.delay = e.changing?.next[0].value;
        });
    });

    e.hr();

    e.component((e) => {
      const data = {
        props: e.ctx.props,
        href: e.ctx.href,
      };
      return (
        <ObjectView
          name={'current'}
          data={data}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const theme = e.ctx.props.theme ?? Route.View.DEFAULT.THEME;
    const isDark = theme === 'Dark';

    e.settings({
      host: { background: isDark ? COLORS.DARK : -0.04 },
      actions: { width: 400 },
      layout: {
        label: {
          topLeft: '<Route.Vew> (Container)',
          bottomLeft: `route: ${e.ctx.route.current.url.href}`,
        },
        position: [150, 80],
        border: isDark ? 0.1 : -0.1,
        cropmarks: isDark ? 0.3 : -0.2,
        labelColor: isDark ? COLORS.WHITE : -0.5,
        background: isDark ? -0.06 : 0.1,
      },
    });
    e.render(<Route.View {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
