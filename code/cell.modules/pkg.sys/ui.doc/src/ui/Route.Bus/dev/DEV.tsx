import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Route } from '../../Route';
import { t, rx } from '../common';

type RouteContext = 'Window' | 'Mock';

type Ctx = {
  bus: t.EventBus<any>;
  route: t.RouteEventsDisposable;
  info?: t.RouteInfo;
  context: RouteContext;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Route.Bus')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const bus = rx.bus();
    const mock = Route.Bus.Dev.mock('https://mock.com/');
    const isMock = () => e.current?.context === 'Mock';

    const route = Route.Bus.Controller({
      instance: { bus, id: 'Route.Bus:dev' },
      getHref: () => (isMock() ? mock.getHref() : location.href),
      pushState(data, unused, url) {
        if (isMock()) {
          mock.pushState(data, unused, url);
        } else {
          history.pushState(data, unused, url);
        }
      },
    });

    const ctx: Ctx = {
      bus,
      route,
      context: 'Mock',
    };

    route.current.$.subscribe((e) => {
      change.ctx((ctx) => (ctx.info = e.info));
    });

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) => {
      const items: RouteContext[] = ['Window', 'Mock'];
      config
        .items(items.map((value) => ({ label: `context: ${value}`, value })))
        .initial(config.ctx.context)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) {
            e.ctx.context = e.changing?.next[0].value;
            e.ctx.route.current.refresh();
          }
        });
    });

    e.hr();

    let count = 0;
    e.button('reset', (e) => {
      count = 0;
      const route = e.ctx.route;
      const dev = route.current.url.query.dev;
      route.change.fire({
        hash: '',
        path: '',
        query: { dev },
      });
    });

    e.hr(1, 0.1);

    e.button('⚡️ change: query.{foo}', (e) => {
      e.ctx.route.change.query([{ key: 'foo', value: `${count++}` }]);
    });
    e.button('⚡️ change: query.{bar}', (e) => {
      e.ctx.route.change.query([{ key: 'bar', value: `${count++}` }]);
    });

    e.button('⚡️ change: "path"', (e) => {
      e.ctx.route.change.path(`path.${count++}`);
    });

    e.button('⚡️ change: "hash"', (e) => {
      e.ctx.route.change.hash(`hash.${count++}`);
    });

    e.hr(1, 0.1);

    e.button('⚡️ current.refresh', async (e) => {
      await e.ctx.route.current.refresh();
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

    e.render(<Route.Dev.UrlText href={route.current.url.href} fontSize={32} />);
  });

export default actions;
