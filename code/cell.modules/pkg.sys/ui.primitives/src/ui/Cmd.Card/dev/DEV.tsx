import React from 'react';
import { Subject } from 'rxjs';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { CmdCard, CmdCardProps } from '..';
import { EventList } from '../../Event.List';
import { css, rx, slug, t, Util } from '../common';
import { CmdCardInfoProps } from '../ui/Info';
import { SampleRenderer, A, B } from './DEV.Renderers';
import { DevSample } from './DEV.Sample';
import { DevSidePanel } from './DEV.SidePanel';

type Ctx = {
  localbus: t.EventBus<any>;
  netbus: t.NetworkBus<any>;
  props: CmdCardProps;
  debug: Debug;
  events: t.CmdCardEventsDisposable;
  state: {
    current?: t.CmdCardState;
    onChange?: (e: t.CmdCardState) => void;
  };
  info: CmdCardInfoProps;
};
type Debug = {
  fireCount: number; // Total number of fires.
  busKind: 'bus' | 'netbus';
  resetHistory$: Subject<void>;
  showSidebar: boolean;
  render: boolean;
  size: { width: number; height: number };
};

/**
 * Helpers
 */
const Helpers = {
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
    const props: CmdCardProps = { ...ctx.props };
    return props;
  },

  toState(ctx: Ctx) {
    return ctx.props.state || (ctx.props.state = Util.state.default());
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
    const instance: t.CmdCardInstance = { bus: rx.bus(), id: `foo.${slug()}` };

    const events = CmdCard.Events({ instance });

    const ctx: Ctx = {
      localbus,
      netbus,

      props: { instance, showAsCard: true },
      events,
      state: {
        onChange(state) {
          e.change.ctx((ctx) => (ctx.state.current = state));
        },
      },
      debug: {
        render: true,
        fireCount: 0,
        busKind: 'netbus',
        resetHistory$: new Subject<void>(),
        showSidebar: true,
        size: { width: 500, height: 320 },
      },
      info: {
        state: { isControllerEnabled: true },
        onStateControllerToggle({ to }) {
          e.change.ctx((ctx) => (ctx.info.state.isControllerEnabled = to));
          e.redraw();
        },
      },
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
    e.button('fire (1)', (e) => Helpers.fire(e.ctx, 1));
    e.button('fire (100)', (e) => Helpers.fire(e.ctx, 100));
    e.button('fire (1,000)', (e) => Helpers.fire(e.ctx, 1000));
    e.hr(1, 0.1);
    e.button('reset', (e) => e.ctx.debug.resetHistory$.next());
    e.hr();
  })

  .items((e) => {
    e.title('Props');

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
        .title('fields: ')
        .items(CmdCard.Info.fields.all)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as t.CmdCardStateInfoFields[];
            e.ctx.info.fields = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr(1, 0.1);

    e.button('spinning (toggle)', async (e) => {
      await e.ctx.events.state.patch((state) => {
        const textbox = state.commandbar.textbox;
        textbox.spinning = !Boolean(textbox.spinning);
      });
    });

    e.button('[TODO] isOpen (toggle)', async (e) => {
      await e.ctx.events.state.patch((state) => {
        state.body.isOpen = !Boolean(state.body.isOpen);
      });
    });

    e.button('sample renderers (toggle)', async (e) => {
      const { body, backdrop } = SampleRenderer;
      await e.ctx.events.state.patch((state) => {
        const exists = Boolean(state.body.render);
        state.body.render = exists ? Util.renderNull : body;
        state.backdrop.render = exists ? Util.renderNull : backdrop;
      });
    });

    e.select((config) => {
      config
        .title('body.show')
        .items(['Hidden', 'CommandBar', 'FullScreen'])
        .initial('CommandBar')
        .view('buttons')
        .pipe(async (e) => {
          if (e.changing) {
            const next = e.changing?.next[0].value;
            await e.ctx.events.state.patch((state) => (state.body.show = next));
          }
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Events');

    e.button('⚡️ Focus', (e) => e.ctx.events.commandbar.focus());
    e.button('⚡️ Blur', (e) => e.ctx.events.commandbar.blur());
    e.hr(1, 0.1);
    e.button('⚡️ Select (All)', (e) => e.ctx.events.commandbar.select());
    e.button('⚡️ Cursor: Start', (e) => e.ctx.events.commandbar.cursor.start());
    e.button('⚡️ Cursor: End', (e) => e.ctx.events.commandbar.cursor.end());

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.button('change instance: { bus, id }', (e) => {
      e.ctx.props.instance = { bus: rx.bus(), id: `foo.${slug()}` };
    });

    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });

    e.boolean('show sidebar (info)', (e) => {
      if (e.changing) e.ctx.debug.showSidebar = e.changing.next;
      e.boolean.current = e.ctx.debug.showSidebar;
    });
    e.button('redraw', (e) => e.redraw());

    e.hr(1, 0.1);

    const size = (width: number, height: number, suffix?: string) => {
      const label = `size: ${width} x ${height}${suffix ?? ''}`;
      e.button(label, (e) => (e.ctx.debug.size = { width, height }));
    };

    size(200, 100, ' - too small');
    size(500, 320, ' - (default)');
    size(800, 600);

    e.hr();
    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={Helpers.toProps(e.ctx)}
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
          data={e.ctx.state.current}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$', '$.backdrop', '$.body']}
        />
      );
    });
  })

  .subject((e) => {
    const { debug } = e.ctx;
    const { width, height } = debug.size;
    const { bus, busKind } = Helpers.toBus(e.ctx);
    const props = Helpers.toProps(e.ctx);
    const instance = rx.bus.instance(bus);

    const SIDEPANEL = { WIDTH: 230 };
    const showSidebar = debug.showSidebar && width < 600;
    const bottomRight = busKind === 'netbus' ? `${instance}` : `${instance} (local)`;

    e.settings({
      host: { background: -0.04 },
      actions: { width: 330 },
      layout: {
        cropmarks: -0.2,
        offset: showSidebar ? [0 - SIDEPANEL.WIDTH, 0] : undefined,
        width,
        height,
        label: {
          topLeft: '<CmdCard>',
          bottomRight: width > 300 ? bottomRight : undefined,
        },
      },
    });

    const styles = {
      base: css({ position: 'relative', flex: 1, display: 'flex' }),
    };

    const elInfo = <CmdCard.Info {...e.ctx.info} />;
    const elEventList = <EventList style={{ flex: 1 }} bus={bus} reset$={debug.resetHistory$} />;
    const elSidebar = showSidebar && (
      <DevSidePanel top={elInfo} bottom={elEventList} width={SIDEPANEL.WIDTH} />
    );

    const el = debug.render && (
      <div {...styles.base}>
        {elSidebar}
        <DevSample
          props={props}
          isControllerEnabled={e.ctx.info.state.isControllerEnabled}
          onStateChange={e.ctx.state.onChange}
        />
      </div>
    );

    e.render(el);
  });

export default actions;
