import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { App, AppProps } from '..';

import { Photo, rx, slug, t, Vimeo, Fullscreen } from '../common';

type Ctx = {
  props: AppProps;
  events: {
    video: t.VimeoEvents;
    fullscreen: t.FullscreenEvents;
  };
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

    const events = {
      video: Vimeo.Events({ instance }),
      fullscreen: Fullscreen.Events({ instance }),
    };

    const ctx: Ctx = {
      events,
      props: {
        instance,
        photos: [
          { url: '/static/images/paul/g-street-bob-kath-gay.png' },
          { url: '/static/images/paul/head-shot.png' },
          { url: '/static/images/paul/paul-randel.png' },
        ],
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Controls');

    e.button('music: start', (e) => e.ctx.events.video.play.fire());
    e.button('music: stop', (e) => e.ctx.events.video.pause.fire());

    e.hr(1, 0.1);
    e.button('fullscreen: enter', (e) => e.ctx.events.fullscreen.enter.fire());
    e.button('fullscreen: exit', (e) => e.ctx.events.fullscreen.exit.fire());

    e.hr();
  })

  .items((e) => {
    e.title('Images');

    e.component((e) => {
      return (
        <Photo.Debug.DefsSelector
          def={e.ctx.props.photos}
          index={e.ctx.props.index}
          style={{ MarginX: 20, MarginY: 15 }}
          onSelectionChange={({ to }) => {
            e.change.ctx((ctx) => (ctx.props.index = to));
          }}
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
