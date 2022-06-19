import React from 'react';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView, toObject } from 'sys.ui.dev';

import { CmdBar, CmdBarProps } from '..';
import { Icons, COLORS, rx, slug, t } from '../common';
import { DevSample } from './DEV.Sample';
import { DevLayout } from './DEV.Layout';

type Ctx = {
  netbus: t.NetworkBus<any>;
  props: CmdBarProps;
  events: t.CmdBarEvents;
  debug: { fireCount: number };
  output: { state?: t.CmdBarState };
  onStateChange: t.CmdBarStateChangeHandler;
};

type TraySampleKind = 'Placeholder' | 'Icons';

/**
 * Helpers
 */
const Util = {
  textbox(ctx: Ctx) {
    return ctx.props.textbox || (ctx.props.textbox = {});
  },

  assignTray(ctx: Ctx, kind: TraySampleKind) {
    const { props } = ctx;
    props.tray = undefined;

    if (kind === 'Icons') {
      const keys = Array.from({ length: 3 }).map((_, i) => ({ key: `icon-${i}` }));
      const items = keys.map((_, i) => <Icons.Face key={`icon-${i}`} color={1} />);
      props.tray = <CmdBar.Tray.Icons items={items} />;
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
      output: {},

      onStateChange(e) {
        change.ctx((ctx) => (ctx.output.state = e.state));
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;

    // Util.assignTray(e.ctx, 'EventPipe');
    Util.assignTray(e.ctx, 'Placeholder');

    e.ctx.events.textbox.focus();
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      const SAMPLES: TraySampleKind[] = ['Placeholder', 'Icons'];
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
            const next = e.changing.next[0].value as TraySampleKind;
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
        .title('placeholder')
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

    let valueCount = 0;

    e.button('⚡️ focus', (e) => e.ctx.events.textbox.focus());
    e.button('⚡️ blur', (e) => e.ctx.events.textbox.blur());
    e.hr(1, 0.1);
    e.button('⚡️ cursor: start', (e) => e.ctx.events.textbox.cursor.start());
    e.button('⚡️ cursor: end', (e) => e.ctx.events.textbox.cursor.end());
    e.hr(1, 0.1);
    e.button('⚡️ select (all)', (e) => e.ctx.events.textbox.select());
    e.button('⚡️ change text', (e) => {
      e.ctx.events.state.patch((state) => {
        state.text = `value-${valueCount++}`;
      });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.hr();
    e.component((e) => {
      const state = e.ctx.output.state;
      const props = e.ctx.props;
      const instance = props.instance;
      const data = {
        ...props,
        instance: { bus: rx.bus.instance(instance.bus), id: instance.id },
        text: state?.text ?? props.text,
        hint: state?.hint ?? props.hint,
        textbox: state?.textbox ?? props.textbox,
      };
      return (
        <ObjectView
          name={'props'}
          data={data}
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
          data={e.ctx.output.state}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const instance = e.ctx.props.instance;

    e.settings({
      host: { background: COLORS.DARK },
      layout: { labelColor: 0.6 },
    });

    e.render(<DevLayout instance={instance} />, {
      position: [0, 0, 0, 0],
    });

    e.render(<DevSample props={e.ctx.props} onStateChange={e.ctx.onStateChange} />, {
      label: {
        bottomRight: `${rx.bus.instance(instance.bus)}/id:"${instance.id}"`,
      },
      width: 600,
      height: 38,
      cropmarks: 0.2,
    });
  });

export default actions;
