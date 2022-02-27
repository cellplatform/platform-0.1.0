import React from 'react';
import { Subject } from 'rxjs';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { EventList, EventListProps } from '..';
import { rx, t } from '../common';
import * as k from '../types';
import { DevSample } from './DEV.Sample';

/**
 * Types
 */
type Ctx = {
  props: EventListProps;
  bus: t.EventBus<any>;
  netbus: t.NetworkBusMock;
  events: k.EventListEvents;
  reset$: Subject<void>;
  debug: CtxDebug;
};

type CtxDebug = {
  fireCount: number; // Total number of fires.
  busKind: 'bus' | 'netbus';
};

/**
 * Helpers
 */
const Util = {
  /**
   * Fire an event.
   */
  async fire(ctx: Ctx, total: number) {
    const fire = (ctx: Ctx) => {
      ctx.debug.fireCount++;
      const count = ctx.debug.fireCount;

      const event: t.Event = {
        type: `FOO/sample/event-${count}`,
        payload: { count },
      };

      const { busKind } = ctx.debug;
      if (busKind === 'netbus') ctx.netbus.fire(event);
      if (busKind === 'bus') ctx.bus.fire(event);
    };

    new Array(total).fill(ctx).forEach(fire);
  },

  /**
   * Retrieve currently selected bus ("local" or "network").
   */
  toBus(ctx: Ctx): t.EventBus {
    const { busKind } = ctx.debug;
    if (busKind === 'bus') return ctx.bus;
    if (busKind === 'netbus') return ctx.netbus;
    throw new Error(`Bus kind '${busKind}' not supported.`);
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.event.EventList')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = 'sample.foo';
    const events = EventList.Events({ bus, instance });

    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });
    const ctx: Ctx = {
      bus,
      netbus,
      props: { event: { bus, instance } },
      events,
      reset$: new Subject<void>(),
      debug: {
        fireCount: 0,
        busKind: 'netbus',
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    Util.fire(ctx, 3);

    ctx.events.$.subscribe((e) => console.log('events.$:', e));
  })

  .items((e) => {
    e.title('bus');

    e.select((config) => {
      config
        .title('Kind of <EventBus>')
        .items([
          { value: 'bus', label: 'bus (local)' },
          { value: 'netbus', label: 'netbus (network)' },
        ])
        .initial(config.ctx.debug.busKind)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.busKind = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Props');
    e.boolean('[TODO] isSelectable', (e) => {
      // if (e.changing) e.ctx.props = e.changing.next;
      // e.boolean.current = e.ctx.props;
    });

    e.hr();

    e.title('Debug');

    e.button('fire (1)', async (e) => Util.fire(e.ctx, 1));
    e.button('fire (10)', async (e) => Util.fire(e.ctx, 10));

    e.hr(1, 0.1);
    e.button('clear', (e) => e.ctx.reset$.next());

    e.hr();

    e.button('scroll: Top', (e) => e.ctx.events.scroll.fire('Top'));
    e.button('scroll: Bottom', (e) => e.ctx.events.scroll.fire('Bottom'));

    e.hr();

    e.component((e) => {
      return (
        <>
          <ObjectView
            name={'debug'}
            data={e.ctx.debug}
            style={{ MarginX: 15, marginBottom: 15 }}
            fontSize={10}
            expandPaths={['$']}
          />
          <ObjectView
            name={'props'}
            data={e.ctx.props}
            style={{ MarginX: 15 }}
            fontSize={10}
            expandPaths={['$']}
          />
        </>
      );
    });
  })

  .subject((e) => {
    const { busKind } = e.ctx.debug;
    const bus = Util.toBus(e.ctx);
    const busInstance = rx.bus.instance(bus);

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<EventList>',
          bottomRight: busKind === 'netbus' ? `${busInstance} (network)` : `${busInstance} (local)`,
        },
        position: [150, null],
        width: 400,
        cropmarks: -0.2,
        border: -0.03,
      },
    });

    e.render(<DevSample bus={bus} childProps={e.ctx.props} reset$={e.ctx.reset$} />);
  });

export default actions;