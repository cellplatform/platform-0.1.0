import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { VideoStream, VideoStreamProps, VideoStreamBusController, useVideoStreamState } from '.';
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
    VideoStreamBusController({ bus });

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
    const { id, bus } = e.ctx.props;
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<VideoStream>',
        cropmarks: -0.2,
      },
    });

    const Sample: React.FC = () => {
      const { stream } = useVideoStreamState({ id, bus });
      return <VideoStream {...e.ctx.props} stream={stream} />;
    };

    e.render(<Sample />);
  });

export default actions;
