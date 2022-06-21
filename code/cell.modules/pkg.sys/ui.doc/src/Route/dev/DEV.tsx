import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Route } from '..';
import { t, rx } from '../common';

type Ctx = {
  // path: string;
  bus: t.EventBus<any>;
  events: t.RouteEvents;
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
    const events = Route.Controller({ instance: { bus } });

    const ctx: Ctx = {
      bus,
      events,
    };

    events.changed$.subscribe((e) => {
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
      const dev = e.ctx.events.current.query.dev;
      e.ctx.events.change.fire({ query: { dev }, hash: '', path: '' });
    });

    e.hr(1, 0.1);

    e.button('change: query', (e) => {
      e.ctx.events.change.fire({ query: [{ key: 'foo', value: `${count++}` }] });
    });

    e.button('change: hash', (e) => {
      e.ctx.events.change.fire({ hash: `hash-${count++}` });
    });

    e.button('change: path', (e) => {
      e.ctx.events.change.fire({ path: `path-${count++}` });
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'ctx'}
          data={e.ctx}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$', '$.info', '$.info.url']}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      actions: { width: 450 },
      layout: {
        label: '<Route>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
  });

export default actions;
