import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Sample, SampleProps } from '..';

import { IpcBus, t, Window, env } from './common';

type Foo = { type: 'foo'; payload: { count: number; self: string } };
type Ctx = {
  bus: { ipc: t.NetworkBus<Foo> };
  props: SampleProps;
  url: string;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/Sample')
  .context((e) => {
    if (e.prev) return e.prev;

    console.log('env', env);

    const bus = {
      ipc: IpcBus<Foo>(),
    };
    // const netbus = IpcBus<Foo>();

    // console.log('Foo', Foo);
    console.log('-------------------------------------------');
    bus.ipc.$.subscribe((e) => {
      console.log(' >> netbus', e);
    });

    bus.ipc.fire({ type: 'foo', payload: { count: 123, self: env?.self || '' } });

    return { bus, props: { count: 0 }, url: '' };
  })

  .items((e) => {
    e.title('props');
    e.button('count: increment', (e) => e.ctx.props.count++);
    e.button('count: decrement', (e) => e.ctx.props.count--);

    e.hr();

    e.title('Window');

    e.button('window/status', async (e) => {
      const bus = e.ctx.bus.ipc;
      const events = Window.Events({ bus });

      const status = await events.status.get();
      console.log('status', status);
    });

    e.button('window/move', async (e) => {
      const bus = e.ctx.bus.ipc;
      const events = Window.Events({ bus });

      const self = env?.self ?? '';

      const status = await events.status.get();
      console.log('status', status);
      const current = status.windows.find((item) => item.uri === self);

      console.log('current', current);

      if (current) {
        const by = 20;
        const bounds = current.bounds;
        const x = bounds.x + by;
        const y = bounds.y + by;
        events.change.fire(self, { bounds: { x, y } });
      }
    });

    e.textbox((config) =>
      config
        .title('window url')
        .placeholder('url')
        // .initial('initial value')
        .description('My textbox description.')
        .pipe((e) => {
          if (e.changing?.action === 'invoke') {
            e.ctx.url = e.changing.next;
          }
        }),
    );

    e.button('window/new', async (e) => {
      const bus = e.ctx.bus.ipc;
      const events = Window.Events({ bus });

      const url = e.ctx.url;

      console.log('url', url);

      if (url) {
        events.create.fire({ url });
      }

      //
    });
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Sample>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
