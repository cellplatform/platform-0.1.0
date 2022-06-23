import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { RouteViewProps } from '..';
import { SAMPLE } from '../../DEV.Sample.data';
import { Route } from '../../Route';
import { RouteBus, rx, t, COLORS } from '../common';
import { DevRouteTable } from './DEV.Sample.RouteTable';

type Ctx = {
  instance: t.RouteInstance;
  href: string;
  route: t.RouteEvents;
  props: RouteViewProps;
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
  .namespace('ui.Route.View')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const bus = rx.bus();
    const instance: t.RouteInstance = { bus };

    const { getUrl, pushState } = RouteBus.Dev.mock('https://domain.com/');
    const route = RouteBus.Controller({ instance: { bus }, getUrl, pushState });
    route.current.$.subscribe((e) => change.ctx((ctx) => (ctx.href = e.info.url.href)));

    const ctx: Ctx = {
      instance,
      route,
      href: route.current.url.href,
      props: {
        instance,
        routes: DevRouteTable.routes,
        theme: Route.View.DEFAULT.THEME,
        debug: { renderCount: true },
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Routes');

    const routeButton = (path: string) => {
      const label = `url: ${path}`;
      e.button(label, (e) => e.ctx.route.change.fire({ path }));
    };

    routeButton('/');

    e.hr(1, 0.1);
    e.markdown('Type "Document": `ns/doc:name`');
    SAMPLE.defs.forEach((def) => routeButton(def.path));

    e.hr(1, 0.1);
    e.markdown('Type "Diagram": `ns/diagram:name`');
    routeButton('/foo/diagram:sample-1');

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
