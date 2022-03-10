import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { EventPipeHookArgs, UIEvents } from '..';
import { t, rx, slug } from './DEV.common';
import { DevSample, EventCtx } from './DEV.Sample';

type Ctx = {
  events: t.UIEvents<EventCtx>;
  args: EventPipeHookArgs<EventCtx, HTMLDivElement>;
  render: boolean;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.UIEvents')
  .context((e) => {
    if (e.prev) return e.prev;

    const instance = `demo.${slug()}`;
    const bus = rx.bus();
    const events = UIEvents<EventCtx>({ bus, instance });
    const ctx: Ctx = {
      render: true,
      events,
      args: {
        bus,
        instance,
        ctx: { index: 0, message: 'hello' },
      },
    };

    return ctx;
  })

  .init(async (e) => {
    e.ctx.events.$.subscribe((e) => {
      console.log('events.$:', e);
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
          topLeft: 'hook: useEventPipe(bus)',
          bottomRight: `${rx.bus.instance(bus)}`,
        },
      },
    });

    if (e.ctx.render) {
      e.render(<DevSample args={args} />);
    }
  });

export default actions;
