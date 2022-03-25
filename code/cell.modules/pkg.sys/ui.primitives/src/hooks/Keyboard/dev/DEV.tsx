import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { KeyboardEventPipeHookArgs, KeyboardEvents, Keyboard } from '..';
import { t, rx } from './DEV.common';
import { DevSample } from './DEV.Sample';

type Ctx = {
  events: t.KeyboardEvents;
  args: KeyboardEventPipeHookArgs;
  render: boolean;
  state?: t.KeyboardState;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.Keyboard')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const events = KeyboardEvents({ bus });

    const ctx: Ctx = {
      render: true,
      events,
      args: { bus },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, redraw } = e;
    const bus = ctx.args.bus;

    /**
     * Example: raw state-monitor (without the hook).
     */
    const keyboard = Keyboard.State.singleton(bus);

    keyboard.state$.subscribe((e) => {
      ctx.state = e;
      redraw();
    });
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('render', (e) => {
      if (e.changing) e.ctx.render = e.changing.next;
      e.boolean.current = e.ctx.render;
    });

    e.hr();
    e.component((e) => {
      return (
        <ObjectView
          name={'hook.args'}
          data={e.ctx.args}
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
          name={'Keyboard.State'}
          data={e.ctx.state}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$', '$.last', '$.current']}
        />
      );
    });
  })

  .subject((e) => {
    const { args } = e.ctx;
    const bus = args.bus;

    e.settings({
      host: { background: -0.04 },
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        label: {
          topLeft: 'hook: useKeyboard(bus)',
          bottomRight: `${rx.bus.instance(bus)}`,
        },
        width: 540,
        height: 300,
        background: 0.3,
      },
    });

    if (e.ctx.render) {
      e.render(<DevSample args={args} style={{ flex: 1 }} />);
    }
  });

export default actions;
