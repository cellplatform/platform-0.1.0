import React from 'react';
import { Subject } from 'rxjs';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { CmdCard, CmdCardProps } from '..';
import { EventList } from '../../Event.List';
import { css, rx, slug, t } from '../common';
import { CmdCardStateInfo, CmdCardStateInfoProps } from '../State.Info';
import { DevSidePanel } from './DEV.SidePanel';

type Ctx = {
  localbus: t.EventBus<any>;
  netbus: t.NetworkBus<any>;
  props: CmdCardProps;
  size: { width: number; height: number };
  debug: Debug;
  state: { info: CmdCardStateInfoProps };
};

type Debug = {
  fireCount: number; // Total number of fires.
  busKind: 'bus' | 'netbus';
  resetEventHistory$: Subject<void>;
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
      if (busKind === 'bus') ctx.localbus.fire(event);
    };

    new Array(total).fill(ctx).forEach(fire);
  },

  /**
   * Retrieve currently selected bus ("local" or "network").
   */
  toBus(ctx: Ctx) {
    const { busKind } = ctx.debug;
    let bus: t.EventBus<any> | undefined;
    if (busKind === 'bus') bus = ctx.localbus;
    if (busKind === 'netbus') bus = ctx.netbus;
    if (!bus) throw new Error(`Bus kind '${busKind}' not supported.`);

    const instance = rx.bus.instance(bus);
    return { bus, instance, busKind };
  },

  toProps(ctx: Ctx) {
    const { bus } = Util.toBus(ctx);

    let props = { ...ctx.props };
    if (typeof props.useState === 'object') {
      props = {
        ...props,
        useState: { ...props.useState, bus },
      };
    }

    return props;
  },

  toState(ctx: Ctx) {
    return ctx.props.useState as t.CmdCardState;
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Cmd.Card')
  .context((e) => {
    if (e.prev) return e.prev;

    const localbus = rx.bus();
    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });

    const ctx: Ctx = {
      localbus,
      netbus,
      props: {
        event: { bus: rx.bus(), instance: `foo.${slug()}` },
        useState: { bus: netbus, tmp: 0, isOpen: false },
        showAsCard: false,
      },
      size: { width: 500, height: 320 },
      debug: { fireCount: 0, busKind: 'netbus', resetEventHistory$: new Subject<void>() },
      state: {
        info: {},
      },
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
    e.button('reset', (e) => {
      e.ctx.debug.resetEventHistory$.next();
    });
    e.hr();
  })

  .items((e) => {
    e.title('Props');

    e.boolean('[TODO] isOpen', (e) => {
      // if (e.changing) e.ctx.props.isOpen = e.changing.next;
      // e.boolean.current = e.ctx.props.isOpen;
    });

    e.boolean('showAsCard', (e) => {
      if (e.changing) e.ctx.props.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.props.showAsCard;
    });

    e.hr();
  })

  .items((e) => {
    e.title('State Info');

    e.select((config) =>
      config
        .title('fields:')
        .items(CmdCardStateInfo.fields.all)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as t.CmdCardStateInfoFields[];
            e.ctx.state.info.fields = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.button('tmp (state increment)', (e) => {
      const state = Util.toState(e.ctx);
      state.tmp++;
    });

    e.button('toggle isOpen', (e) => {
      const state = Util.toState(e.ctx);
      state.isOpen = !Boolean(state.isOpen);
    });

    e.hr();
    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={Util.toProps(e.ctx)}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$', '$.useState']}
        />
      );
    });
  })

  .subject((e) => {
    const { width, height } = e.ctx.size;
    const { bus, busKind } = Util.toBus(e.ctx);
    const props = Util.toProps(e.ctx);
    const instance = rx.bus.instance(bus);

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        width,
        height,
        label: {
          topLeft: '<Cmd.Card>',
          bottomRight: busKind === 'netbus' ? `${instance} (network)` : `${instance} (local)`,
        },
      },
    });

    const styles = {
      base: css({ position: 'relative', flex: 1, display: 'flex' }),
    };

    const { resetEventHistory$ } = e.ctx.debug;
    const elStateInfo = <CmdCard.State.Info fields={e.ctx.state.info.fields} />;
    const elEventList = <EventList bus={bus} reset$={resetEventHistory$} style={{ flex: 1 }} />;

    e.render(
      <div {...styles.base}>
        <DevSidePanel top={elStateInfo} bottom={elEventList} width={230} />
        <CmdCard {...props} style={{ flex: 1 }} />
      </div>,
    );
  });

export default actions;
