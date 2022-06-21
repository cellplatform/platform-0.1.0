import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Route } from '..';
import { t, rx } from '../common';

type Ctx = {
  bus: t.EventBus<any>;
  route: t.RouteEventsDisposable;
  info?: t.RouteInfo;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Route')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const bus = rx.bus();
    const route = Route.Controller({ instance: { bus } });

    const ctx: Ctx = {
      bus,
      route,
    };

    route.changed$.subscribe((e) => {
      change.ctx((ctx) => (ctx.info = e.info));
    });

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    let count = 0;

    e.button('reset', (e) => {
      count = 0;
      const route = e.ctx.route;
      const dev = route.current.query.dev;
      route.change.fire({
        hash: '',
        path: '',
        query: { dev },
      });
    });

    e.hr(1, 0.1);

    e.button('change: query.{foo}', (e) => {
      e.ctx.route.change.query([{ key: 'foo', value: `${count++}` }]);
    });
    e.button('change: query.{bar}', (e) => {
      e.ctx.route.change.query([{ key: 'bar', value: `${count++}` }]);
    });

    e.button('change: "path"', (e) => {
      e.ctx.route.change.path(`path.${count++}`);
    });

    e.button('change: "hash"', (e) => {
      e.ctx.route.change.hash(`hash.${count++}`);
    });

    e.hr();

    e.component((e) => {
      const { route } = e.ctx;

      const data = {
        bus: route.instance,
        current: route.current,
        route,
      };
      return (
        <ObjectView
          name={'ctx'}
          data={data}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$', '$.current']}
        />
      );
    });
  })

  .subject((e) => {
    const { route } = e.ctx;

    e.settings({
      host: { background: -0.04 },
      actions: { width: 450 },
      layout: {
        cropmarks: -0.2,
        label: { bottomRight: '<Route.Dev.UrlText>' },
      },
    });

    e.render(<Route.Dev.UrlText href={route.current.href} fontSize={32} />);
  });

export default actions;
