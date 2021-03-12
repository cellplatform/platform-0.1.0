import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { VideoStream, VideoStreamProps, VideoStreamController } from '.';
import { t, rx, cuid } from '../../common';

type Ctx = {
  bus: t.EventBus<t.VideoEvent>;
  props: VideoStreamProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.video/VideoStream')
  .context((prev) => {
    if (prev) return prev;

    const id = cuid();
    const bus = rx.bus<t.VideoEvent>();
    VideoStreamController({ bus });

    return {
      bus,
      props: {
        id,
        bus,
        isMuted: true,
      },
    };
  })

  .items((e) => {
    e.title('EventBus');

    e.button('VideoStream/getMedia', (e) => {
      e.ctx.bus.fire({
        type: 'VideoStream/getMedia',
        payload: { ref: e.ctx.props.id, constraints: { video: true } },
      });
    });

    e.hr();
  })

  .items((e) => {
    e.title('props');

    e.boolean('isMuted', (e) => {
      if (e.changing) e.ctx.props.isMuted = e.changing.next;
      e.boolean.current = e.ctx.props.isMuted;
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      layout: {
        // label: '<VideoStream>',
        cropmarks: -0.2,
      },
      host: { background: -0.04 },
    });
    e.render(<VideoStream {...e.ctx.props} />);
  });

export default actions;
