import React from 'react';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView, toObject } from 'sys.ui.dev';

import { CmdBar, CmdBarProps } from '..';
import { Icons, COLORS, rx, slug, t } from '../common';
import { DevEventPipe } from './DEV.EventPipe';

type Ctx = {
  netbus: t.NetworkBus<any>;
  props: CmdBarProps;
  events: t.CmdBarEvents;
  debug: {
    fireCount: number; // Total number of fires.
  };
};

type TraySample = 'Placeholder' | 'Icons' | 'EventPipe';

/**
 * Helpers
 */
const Util = {
  /**
   * Fire an event.
   */
  async fireSample(ctx: Ctx, total: number) {
    const fire = (ctx: Ctx) => {
      ctx.debug.fireCount++;
      const count = ctx.debug.fireCount;
      const event: t.Event = { type: `FOO/sample/event-${count}`, payload: { count } };
      ctx.netbus.fire(event);
    };

    new Array(total).fill(ctx).forEach(fire);
  },

  textbox(ctx: Ctx) {
    return ctx.props.textbox || (ctx.props.textbox = {});
  },

  assignTray(ctx: Ctx, kind: TraySample) {
    const { props } = ctx;
    props.tray = undefined;

    if (kind === 'Icons') {
      const items = Array.from({ length: 3 }).map((_, i) => {
        return <Icons.Face key={`icon-${i}`} color={1} />;
      });
      props.tray = <CmdBar.Tray.Icons items={items} />;
    }

    if (kind === 'EventPipe') {
      const netbus = toObject(ctx.netbus) as t.NetworkBus;
      props.tray = <DevEventPipe bus={netbus} style={{ MarginX: 8, width: 150 }} />;
    }

    if (kind === 'Placeholder') {
      props.tray = <CmdBar.Tray.Placeholder />;
    }
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Cmd.Bar')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const instance = { bus: rx.bus(), id: `foo.${slug()}` };
    const events = CmdBar.Controller({ instance });
    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });

    const ctx: Ctx = {
      netbus,
      events,
      props: {
        instance,
        textbox: { placeholder: 'my command', pending: false, spinning: false },
        onChange({ to }) {
          // change.ctx((ctx) => (ctx.props.text = to));
        },
        onAction(e) {
          console.log('!onAction', e);
        },
      },
      debug: { fireCount: 0 },
    };

    events.text.changed$.subscribe((e) => {
      // NB: Or do this in the direct [onChange] handler.
      change.ctx((ctx) => (ctx.props.text = e.text));
    });

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;

    // Util.assignTray(e.ctx, 'EventPipe');
    Util.assignTray(e.ctx, 'Placeholder');
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      const SAMPLES: TraySample[] = ['Placeholder', 'Icons', 'EventPipe'];
      config
        .title('tray (render):')
        .items([
          { label: '<undefined>', value: undefined },
          ...SAMPLES.map((value) => ({ label: `sample: ${value}`, value })),
        ])
        .initial('Placeholder')
        .view('buttons')
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next[0].value as TraySample;
            Util.assignTray(e.ctx, next);
          }
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Props.Textbox');

    e.boolean('spinning', (e) => {
      const textbox = Util.textbox(e.ctx);
      if (e.changing) textbox.spinning = e.changing.next;
      e.boolean.current = textbox.spinning;
    });

    e.boolean('pending', (e) => {
      const textbox = Util.textbox(e.ctx);
      if (e.changing) textbox.pending = e.changing.next;
      e.boolean.current = textbox.pending;
    });

    e.textbox((config) =>
      config
        .placeholder('placeholder')
        .initial(config.ctx.props.textbox?.placeholder || '<nothing>')
        .pipe((e) => {
          if (e.changing?.action === 'invoke') {
            const textbox = Util.textbox(e.ctx);
            e.textbox.current = e.changing.next || undefined;
            textbox.placeholder = e.textbox.current;
          }
        }),
    );

    e.hr();
  })

  .items((e) => {
    e.title('Events');

    e.button('⚡️ focus', (e) => e.ctx.events.text.focus());
    e.button('⚡️ blur', (e) => e.ctx.events.text.blur());
    e.hr(1, 0.1);
    e.button('⚡️ cursor: start', (e) => e.ctx.events.text.cursor.start());
    e.button('⚡️ cursor: end', (e) => e.ctx.events.text.cursor.end());
    e.hr(1, 0.1);
    e.button('⚡️ select (all)', (e) => e.ctx.events.text.select());
    e.button('⚡️ change text', (e) => e.ctx.events.text.change('Foobar'));

    e.hr();
  })

  .items((e) => {
    e.title('EventBus (Tray Sample)');

    e.markdown((config) =>
      config
        .text(`Fire sample events when tray element is set to the <EventPipe>`)
        .margin([0, 10, 0, 30]),
    );

    e.button('EventPipe: fire (1)', (e) => Util.fireSample(e.ctx, 1));
    e.button('EventPipe: fire (100)', (e) => Util.fireSample(e.ctx, 100));
    e.button('EventPipe: fire (1K)', (e) => Util.fireSample(e.ctx, 1000));
    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.hr();
    e.component((e) => {
      const instance = e.ctx.props.instance;
      const props = {
        ...e.ctx.props,
        instance: { bus: rx.bus.instance(instance.bus), id: instance.id },
      };
      return (
        <ObjectView
          name={'props'}
          data={props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$', '$.instance']}
        />
      );
    });
  })

  .subject((e) => {
    const instance = e.ctx.props.instance;

    e.settings({
      host: { background: COLORS.DARK },
      layout: {
        label: {
          topLeft: '<CmdBar>',
          bottomRight: `${rx.bus.instance(instance.bus)}/id:${instance.id}`,
        },
        width: 600,
        height: 38,
        cropmarks: 0.2,
        labelColor: 0.6,
      },
    });

    e.render(<CmdBar {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
