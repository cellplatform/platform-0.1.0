import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { KeyboardPipeHookArgs, KeyboardEvents } from '..';
import { t, rx, slug } from './DEV.common';
import { DevSample } from './DEV.Sample';

type Ctx = {
  events: t.KeyboardEvents;
  args: KeyboardPipeHookArgs;
  render: boolean;
  tmp: any;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.Keyboard')
  .context((e) => {
    if (e.prev) return e.prev;

    const instance = `demo.${slug()}`;
    const bus = rx.bus();
    const events = KeyboardEvents({ bus });
    const ctx: Ctx = {
      render: true,
      events,
      args: { bus },
      tmp: {},
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, redraw } = e;
    e.ctx.events.$.subscribe((ev) => {
      const { payload } = ev;
      console.log('events.$:', payload);

      const { key, is } = payload;
      const { code, metaKey, ctrlKey, shiftKey, altKey } = payload.keyboard;
      const modifiers = { metaKey, ctrlKey, shiftKey, altKey };

      const tmp: any = (ctx.tmp = { payload, key, code, modifiers });

      const modifier = (field: string, matchKey: string) => {
        if (is.down && key === matchKey) tmp[field] = true;
        if (is.up && key === matchKey) delete tmp[field];
      };

      modifier('META', 'Meta');
      modifier('SHIFT', 'Shift');
      modifier('CTRL', 'Ctrl');
      modifier('ALT', 'Alt');

      redraw();
    });
  })

  .items((e) => {
    e.boolean('render', (e) => {
      if (e.changing) e.ctx.render = e.changing.next;
      e.boolean.current = e.ctx.render;
    });

    e.component((e) => {
      return (
        <ObjectView
          name={'tmp'}
          data={e.ctx.tmp}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

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
          topLeft: 'hook: useKeyboardPipe(bus)',
          bottomRight: `${rx.bus.instance(bus)}`,
        },
        width: 500,
        height: 300,
      },
    });

    if (e.ctx.render) {
      e.render(<DevSample args={args} style={{ flex: 1 }} />);
    }
  });

export default actions;
