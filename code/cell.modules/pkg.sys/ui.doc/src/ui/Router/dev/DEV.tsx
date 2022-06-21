import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Router, RouterProps } from '..';
import { t, rx, Route } from '../common';

import { SAMPLE } from '../../DEV.Sample.data';

type Ctx = {
  instance: t.RouteInstance;
  href: string;
  route: t.RouteEvents;
  props: RouterProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Router')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const bus = rx.bus();
    const instance: t.RouteInstance = { bus };

    const { location, pushState } = Route.mock('https://domain.com/');
    const route = Route.Controller({ instance: { bus }, location, pushState });

    route.changed$.subscribe((e) => {
      change.ctx((ctx) => (ctx.href = e.info.url.href));
    });

    const ctx: Ctx = {
      instance,
      route,
      href: route.current.href,
      props: { instance },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    const pathButton = (path: string) => {
      e.button(`path: "${path}"`, (e) => e.ctx.route.change.fire({ path }));
    };

    pathButton('/');
    SAMPLE.defs.forEach((def) => pathButton(def.path));

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
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
          topRight: e.ctx.route.current.href,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Router {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
