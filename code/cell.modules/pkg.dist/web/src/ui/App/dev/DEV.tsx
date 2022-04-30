import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { App, AppProps } from '..';

import { Photo, rx, slug, t, Vimeo, Fullscreen, DEFAULT } from '../common';

type Seconds = number;

type Ctx = {
  events: t.AppEvents;
  video: t.VimeoEvents;
  // events: {
  //   video: t.VimeoEvents;
  //   fullscreen: t.FullscreenEvents;
  // };
  props: AppProps;
  debug: { json: boolean };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.App')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const id = `foo.${slug()}`;
    const instance = { bus, id };

    const video = Vimeo.Events({ instance });

    const ctx: Ctx = {
      events: App.Events({ instance }),
      video,
      props: { instance, state: DEFAULT.STATE },
      debug: { json: false },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, redraw } = e;
    const { instance } = ctx.props;

    const controller = App.Controller({ instance });

    controller.state.$.subscribe((e) => {
      ctx.props.state = e.value;
      redraw();
    });
  })

  .items((e) => {
    e.title('Controls');

    e.button('fullscreen: enter', (e) => e.ctx.events.fullscreen(true));

    // e.button('video: start', (e) => e.ctx.video.play.fire());
    e.button('video: start', (e) => e.ctx.events.video.player.play.fire());
    e.button('video: stop', (e) => e.ctx.events.video.player.pause.fire());
    e.button('video: hide', (e) => e.ctx.events.video.hide());

    e.hr(1, 0.1);

    const jumpToEnd = async (ctx: Ctx, beforeEnd: Seconds) => {
      const player = ctx.events.video.player;
      const status = (await player.status.get()).status;

      if (status) {
        const total = status.duration;
        player.seek.fire(total - beforeEnd);
      }
    };

    const jumpToEndButton = (beforeEnd: Seconds) => {
      e.button(`video: jump ${beforeEnd}s before end`, async (e) => {
        // jumpToEnd(e.ctx, beforeEnd);

        const player = e.ctx.events.video.player;
        const status = (await player.status.get()).status;

        console.log('status', status);

        if (status) {
          const total = status.duration;
          player.seek.fire(total - beforeEnd);
        }
      });
    };

    jumpToEndButton(2);
    jumpToEndButton(5);
    jumpToEndButton(30);

    // e.button('video: jump to end', async (e) => {
    //   jumpToEnd(2);
    // });

    e.hr(1, 0.1);

    e.button('open antechamber (toggle)', (e) => {
      e.ctx.events.state.patch((state) => (state.auth.isOpen = !state.auth.isOpen));
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

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

    e.hr(1, 0.1);

    e.component((e) => {
      return (
        <ObjectView
          name={'state'}
          data={e.ctx.props.state}
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
        label: '<App>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<App {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
