import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { Fullscreen } from '..';
import { rx, slug, t } from '../common';
import { DevSample, DevSampleProps } from './DEV.Sample';

type Ctx = {
  instance: t.FullscreenInstance;
  events: t.FullscreenEvents;
  props: DevSampleProps;
  debug: { render: boolean; withoutInstance: boolean };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.FullScreen')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = { bus, id: `foo.${slug()}` };
    const events = Fullscreen.Events({ instance });

    const ctx: Ctx = {
      instance,
      events,
      props: { instance },
      debug: { render: true, withoutInstance: false },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    ctx.events.$.subscribe((e) => {
      // console.log('⚡️', e.type, e.payload);
    });
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });

    e.boolean('without instance (bus)', (e) => {
      if (e.changing) e.ctx.debug.withoutInstance = e.changing.next;
      e.boolean.current = e.ctx.debug.withoutInstance;
    });

    e.hr();

    e.button('⚡️ fullscreen.status', async (e) => {
      const res = await e.ctx.events.status.get();
      console.log('res', res);
    });

    e.button('⚡️ fullscreen.enter', async (e) => {
      const res = await e.ctx.events.enter.fire();
      console.log('res', res);
    });

    e.button('⚡️ fullscreen.exit', async (e) => {
      const res = await e.ctx.events.exit.fire();
      console.log('res', res);
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { debug } = e.ctx;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<FullScreen>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const props = { ...e.ctx.props };
    if (debug.withoutInstance) delete props.instance;

    const el = <DevSample {...props} style={{ flex: 1 }} />;
    e.render(debug.render && el);
  });

export default actions;
