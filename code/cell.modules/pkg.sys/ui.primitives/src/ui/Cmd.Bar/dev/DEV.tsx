import React from 'react';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { CmdBar, CmdBarConstants, CmdBarPart, CmdBarProps } from '..';
import { COLORS, rx, slug, t } from '../common';

type Ctx = {
  bus: t.EventBus<any>;
  netbus: t.NetworkBus<any>;
  props: CmdBarProps;
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
  .namespace('ui.Cmd.Bar')
  .context((e) => {
    if (e.prev) return e.prev;

    const id = `foo.${slug()}`;
    const bus = rx.bus();
    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });
    const instance = { bus, id };

    const ctx: Ctx = {
      bus,
      netbus,
      props: {
        instance,
        textbox: { placeholder: 'my command' },
      },
      debug: { fireCount: 0, busKind: 'netbus' },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
    const bus = Util.toBus(e.ctx).bus;

    const { instance } = ctx.props;
    const events = CmdBar.Events({ instance });

    events.$.subscribe((e) => {
      console.log('CmdBar.Events.$', e);
    });

    const controller = CmdBar.State.Controller({ instance, bus });
    controller.state$.subscribe((state) => {
      e.ctx.props.state = state;
      e.redraw();
    });
  })

  .items((e) => {
    e.title('Props');

    e.select((config) =>
      config
        .title('parts:')
        .items(CmdBarConstants.PARTS)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as CmdBarPart[];
            e.ctx.props.parts = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr();
  })

  .items((e) => {
    e.title('Props.Textbox');

    const toTextbox = (ctx: Ctx) => ctx.props.textbox || (ctx.props.textbox = {});

    e.boolean('spinner', (e) => {
      const textbox = toTextbox(e.ctx);
      if (e.changing) textbox.spinner = e.changing.next;
      e.boolean.current = textbox.spinner;
    });

    e.textbox((config) =>
      config
        .title('placeholder')
        .initial(config.ctx.props.textbox?.placeholder || '<nothing>')
        .pipe((e) => {
          if (e.changing?.action === 'invoke') {
            const textbox = toTextbox(e.ctx);
            e.textbox.current = e.changing.next || undefined;
            textbox.placeholder = e.textbox.current;
          }
        }),
    );

    e.hr();
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
    e.button('fire (1)', (e) => Util.fire(e.ctx, 1));
    e.button('fire (100)', (e) => Util.fire(e.ctx, 100));
    e.button('fire (1,000)', (e) => Util.fire(e.ctx, 1000));
    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.button('arrangement (1)', (e) => (e.ctx.props.parts = ['Input', 'Events']));
    e.button('arrangement (2)', (e) => (e.ctx.props.parts = ['Events', 'Input']));

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
    e.hr(1, 0.1);
    e.component((e) => {
      return (
        <ObjectView
          name={'props.state'}
          data={Util.toProps(e.ctx).state}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { bus, instance, busKind } = Util.toBus(e.ctx);
    const props = Util.toProps(e.ctx);

    e.settings({
      host: { background: COLORS.DARK },
      layout: {
        label: {
          topLeft: '<CmdBar>',
          bottomRight: busKind === 'netbus' ? `${instance} (network)` : `${instance} (local)`,
        },
        width: 600,
        height: 38,
        cropmarks: 0.2,
        labelColor: 0.6,
      },
    });

    e.render(
      <CmdBar
        {...props}
        // state={e.ctx.state}
        style={{ flex: 1 }}
        onAction={(e) => console.log('onAction:', e)}
      />,
    );
  });

export default actions;
