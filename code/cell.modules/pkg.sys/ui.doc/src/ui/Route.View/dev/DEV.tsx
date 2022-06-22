import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { RouteView, RouteViewProps } from '..';
import { t, rx, Route } from '../common';
import { Doc } from '../../Doc';

import { SAMPLE } from '../../DEV.Sample.data';
import { DevRouteTable } from './DEV.RouteTable';

type Ctx = {
  instance: t.RouteInstance;
  href: string;
  route: t.RouteEvents;
  props: RouteViewProps;
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

    const { getUrl, pushState } = Route.Dev.mock('https://domain.com/');
    const route = Route.Controller({ instance: { bus }, getUrl, pushState });
    route.current.$.subscribe((e) => change.ctx((ctx) => (ctx.href = e.info.url.href)));

    const ctx: Ctx = {
      instance,
      route,
      href: route.current.url.href,
      props: {
        instance,
        routes: DevRouteTable.routes,
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
    e.title('Dev');

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
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<Router>',
          topRight: `route: ${e.ctx.route.current.url.href}`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<RouteView {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
