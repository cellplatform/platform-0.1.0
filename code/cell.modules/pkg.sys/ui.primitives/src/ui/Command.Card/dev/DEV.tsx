import React from 'react';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { CommandCard, CommandCardProps } from '..';
import { rx, t } from '../../common';

type Ctx = {
  bus: t.EventBus<any>;
  netbus: t.NetworkBus<any>;
  props: CommandCardProps;
  size: { width: number; height: number };
  debug: Debug;
};

type Debug = {
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
      const event: t.Event = { type: `FOO/sample/event-${count}`, payload: { count } };
      const { busKind } = ctx.debug;
      if (busKind === 'netbus') ctx.netbus.fire(event);
      if (busKind === 'bus') ctx.bus.fire(event);
    };

    new Array(total).fill(ctx).forEach(fire);
  },

  /**
   * Retrieve currently selected bus ("local" or "network").
   */
  toBus(ctx: Ctx) {
    const { busKind } = ctx.debug;
    let bus: t.EventBus<any> | undefined;
    if (busKind === 'bus') bus = ctx.bus;
    if (busKind === 'netbus') bus = ctx.netbus;
    if (!bus) throw new Error(`Bus kind '${busKind}' not supported.`);

    const instance = rx.bus.instance(bus);
    return { bus, instance, busKind };
  },

  toProps(ctx: Ctx) {
    const { bus } = Util.toBus(ctx);
    const props = { ...ctx.props, bus };
    return props;
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Command.Card')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });

    const ctx: Ctx = {
      bus,
      netbus,
      props: { bus },
      size: { width: 500, height: 320 },
      debug: { fireCount: 0, busKind: 'netbus' },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
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

    e.hr(1, 0.1);
    e.button('fire', (e) => Util.fire(e.ctx, 1));
    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.hr();
    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={Util.toProps(e.ctx)}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { width, height } = e.ctx.size;
    const { instance, busKind } = Util.toBus(e.ctx);
    const props = Util.toProps(e.ctx);

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        width,
        height,
        label: {
          topLeft: '<CommandCard>',
          bottomRight: busKind === 'netbus' ? `${instance} (network)` : `${instance} (local)`,
        },
      },
    });
    e.render(<CommandCard {...props} style={{ flex: 1 }} />);
  });

export default actions;
