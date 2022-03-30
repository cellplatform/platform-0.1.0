import React from 'react';
import { Subject } from 'rxjs';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { CmdCard, CmdCardProps } from '..';
import { EventList } from '../../Event.List';
import { css, rx, slug, t } from '../common';
import { CmdCardStateInfoProps } from '../components/State.Info';
import { Util } from '../Util';
import { DevSample } from './DEV.Sample';
import { DevSidePanel } from './DEV.SidePanel';

type Ctx = {
  localbus: t.EventBus<any>;
  netbus: t.NetworkBus<any>;
  props: CmdCardProps;
  debug: Debug;
  size: { width: number; height: number };
  events: t.CmdCardEvents;
  state?: t.CmdCardState;
  onStateChange?: (e: t.CmdCardState) => void;
};

type Debug = {
  fireCount: number; // Total number of fires.
  busKind: 'bus' | 'netbus';
  resetHistory$: Subject<void>;
  state: { info: CmdCardStateInfoProps };
};

/**
 * Helpers
 */
const Dev = {
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
    return { bus, busKind };
  },

  toProps(ctx: Ctx) {
    let props: CmdCardProps = { ...ctx.props };
    props = { ...props };

    return props;
  },

  toState(ctx: Ctx) {
    return ctx.props.state || (ctx.props.state = Util.defaultState());
  },

  localbus(ctx: Ctx) {
    return rx.busAsType<t.CmdCardEvent>(ctx.localbus);
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
    const instance: t.CmdCardInstance = { bus: localbus, id: `foo.${slug()}` };
    const events = CmdCard.Events({ instance });

    const ctx: Ctx = {
      localbus,
      netbus,
      size: { width: 500, height: 320 },
      props: { instance, showAsCard: true },
      debug: {
        fireCount: 0,
        busKind: 'netbus',
        resetHistory$: new Subject<void>(),
        state: { info: {} },
      },
      events,
      onStateChange: (state) => e.change.ctx((ctx) => (ctx.state = state)),
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
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
    e.button('fire (1)', (e) => Dev.fire(e.ctx, 1));
    e.button('fire (100)', (e) => Dev.fire(e.ctx, 100));
    e.button('fire (1,000)', (e) => Dev.fire(e.ctx, 1000));
    e.hr(1, 0.1);
    e.button('reset', (e) => e.ctx.debug.resetHistory$.next());
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
    e.title('State');

    e.select((config) =>
      config
        .title('fields:')
        .items(CmdCard.State.Info.fields.all)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as t.CmdCardStateInfoFields[];
            e.ctx.debug.state.info.fields = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr();
  })

  .items((e) => {
    e.title('Debug');
    e.button('redraw', (e) => e.redraw());
    e.hr(1, 0.1);

    e.button('tmp ', async (e) => {
      await e.ctx.events.state.mutate(async (state) => {
        const styles = {
          base: css({ Absolute: 0, padding: 15 }),
        };

        let count = 0;
        state.body.render = (e) => {
          count++;
          return <div {...styles.base}>hello body {count}</div>;
        };

        state.backdrop.render = (e) => {
          return <div {...styles.base}>hello backdrop {count}</div>;
        };
      });
    });

    e.button('spinning (toggle)', async (e) => {
      await e.ctx.events.state.mutate(async (state) => {
        state.commandbar.spinning = !Boolean(state.commandbar.spinning);
      });
    });

    e.button('isOpen (toggle)', async (e) => {
      await e.ctx.events.state.mutate(async (state) => {
        // state.commandbar.spinning = !Boolean(state.commandbar.spinning);
        state.isOpen = !Boolean(state.isOpen);
      });

      // const state = Dev.toState(e.ctx);
    });

    e.hr();
    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={Dev.toProps(e.ctx)}
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
          name={'state'}
          data={e.ctx.state}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { debug } = e.ctx;
    const { width, height } = e.ctx.size;
    const { bus, busKind } = Dev.toBus(e.ctx);
    const props = Dev.toProps(e.ctx);
    const instance = rx.bus.instance(bus);

    const SIDEPANEL = { WIDTH: 230 };

    e.settings({
      host: { background: -0.04 },
      actions: { width: 330 },
      layout: {
        cropmarks: -0.2,
        offset: [0 - SIDEPANEL.WIDTH, 0],
        width,
        height,
        label: {
          topLeft: '<CmdCard>',
          bottomRight: busKind === 'netbus' ? `${instance} (network)` : `${instance} (local)`,
        },
      },
    });

    const styles = {
      base: css({ position: 'relative', flex: 1, display: 'flex' }),
    };

    const elStateInfo = <CmdCard.State.Info {...debug.state.info} />;
    const elEventList = <EventList style={{ flex: 1 }} bus={bus} reset$={debug.resetHistory$} />;

    e.render(
      <div {...styles.base}>
        <DevSidePanel top={elStateInfo} bottom={elEventList} width={SIDEPANEL.WIDTH} />
        <DevSample bus={bus} props={props} onStateChange={e.ctx.onStateChange} />
      </div>,
    );
  });

export default actions;
