import React from 'react';
import { Subject } from 'rxjs';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { EventList, EventListProps } from '..';
import { rx, t } from '../common';
import * as k from '../types';

/**
 * Types
 */
type Ctx = {
  bus: t.EventBus<any>;
  netbus: t.NetworkBusMock;
  props: EventListProps;
  events: k.EventListEvents;
  debug: Debug;
};

type Debug = {
  fireCount: number; // Total number of fires.
  busKind: 'bus' | 'netbus';
  reset$: Subject<void>;
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

      Util.toBus(ctx).fire({
        type: `FOO/sample/event.${count}`,
        payload: { count },
      });
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

  /**
   * Retrieve the {props.debug} object.
   */
  toPropsDebug(ctx: Ctx) {
    return ctx.props.debug || (ctx.props.debug = {});
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.EventList')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = 'sample.foo';
    const events = EventList.Events({ bus, instance });

    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });
    const ctx: Ctx = {
      bus,
      netbus,
      events,
      props: { bus: netbus, debug: { showBus: false } },
      debug: {
        fireCount: 0,
        busKind: 'netbus',
        reset$: new Subject<void>(),
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
    e.title('Props');
    e.boolean('[TODO] isSelectable', (e) => {
      // if (e.changing) e.ctx.props = e.changing.next;
      // e.boolean.current = e.ctx.props;
    });

    e.hr();
  })

  .items((e) => {
    e.title('EventBus');

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

    e.hr(1, 0.1);
    e.button('reset', (e) => e.ctx.debug.reset$.next());
    e.hr(1, 0.1);
    e.button('fire (1)', (e) => Util.fire(e.ctx, 1));
    e.button('fire (10)', (e) => Util.fire(e.ctx, 10));
    e.button('fire (100)', (e) => Util.fire(e.ctx, 100));

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('showBus ("instance")', (e) => {
      const debug = Util.toPropsDebug(e.ctx);
      if (e.changing) debug.showBus = e.changing.next;
      e.boolean.current = Boolean(debug.showBus);
    });

    e.hr(1, 0.1);

    e.button('[TODO] scroll: Top', (e) => e.ctx.events.scroll.fire('Top'));
    e.button('[TODO] scroll: Bottom', (e) => e.ctx.events.scroll.fire('Bottom'));

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
    const { busKind, reset$ } = e.ctx.debug;
    const bus = Util.toBus(e.ctx);
    const instance = rx.bus.instance(bus);

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<EventList>',
          bottomRight: busKind === 'netbus' ? `${instance} (network)` : `${instance} (local)`,
        },
        position: [150, null],
        width: 400,
        cropmarks: -0.2,
        border: -0.03,
      },
    });

    e.render(<EventList {...e.ctx.props} bus={bus} reset$={reset$} style={{ flex: 1 }} />);
  });

export default actions;
