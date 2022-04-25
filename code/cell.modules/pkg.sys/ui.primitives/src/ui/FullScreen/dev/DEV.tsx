import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DevSample, DevSampleProps } from './DEV.Sample';
import { rx, t, slug, time } from '../common';
import { FullScreen } from '..';

type Ctx = {
  instance: t.FullscreenInstance;
  events: t.FullscreenEvents;
  props: DevSampleProps;
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
    const events = FullScreen.Events({ instance });

    const ctx: Ctx = {
      instance,
      props: { instance },
      events,
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

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
    e.render(<DevSample {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
