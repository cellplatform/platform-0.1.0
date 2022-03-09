import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { UIEventBusHookArgs, UIEvents } from '..';
import { t, rx, slug } from './DEV.common';
import { DevSample, EventCtx } from './DEV.Sample';

type Ctx = {
  events: t.UIEvents<EventCtx>;
  args: UIEventBusHookArgs<EventCtx, HTMLDivElement>;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.useUIEvents')
  .context((e) => {
    if (e.prev) return e.prev;

    const instance = `demo.${slug()}`;
    const bus = rx.bus();
    const events = UIEvents<EventCtx>({ bus, instance });
    const ctx: Ctx = {
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

    e.ctx.events.mouse.$.subscribe((e) => {
      // console.log("e", e)
      // const f = e.c

      console.log('containsFocus', e.target.containsFocus);
    });
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
    });

    e.render(<DevSample args={args} />, {
      border: -0.1,
      cropmarks: -0.2,
      label: {
        topLeft: 'hook: useUIEvents',
        bottomRight: `${rx.bus.instance(bus)}`,
      },
    });
  });

export default actions;
