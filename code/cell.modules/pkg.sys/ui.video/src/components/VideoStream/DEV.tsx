import React from 'react';
import { filter } from 'rxjs/operators';
import { DevActions } from 'sys.ui.dev';

import {
  useVideoStreamState,
  VideoStream,
  VideoStreamBusController,
  VideoStreamEvents,
  VideoStreamProps,
  VideoStreamRecordController,
} from '.';
import { cuid, log, rx, t } from '../../common';

type Ctx = {
  bus: t.EventBus<t.VideoEvent>;
  events: ReturnType<typeof VideoStreamEvents>;
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
    const events = VideoStreamEvents({ bus });
    VideoStreamBusController({ bus });
    VideoStreamRecordController({ ref: id, bus });

    rx.payload<t.VideoStreamRecordErrorEvent>(bus.event$, 'VideoStream/record/error')
      .pipe(filter((e) => e.ref === id))
      .subscribe((e) => {
        log.info('error', e);
      });

    return {
      bus,
      events,
      props: { id, bus, isMuted: true },
    };
  })

  .items((e) => {
    e.title('Get Started');
    e.button('fire: VideoStream/get', async (e) => {
      const ref = e.ctx.props.id;
      e.ctx.bus.fire({
        type: 'VideoStream/get',
        payload: { ref, constraints: { video: true } },
      });
    });
    e.hr();
  })

  .items((e) => {
    e.title('Props');
    e.boolean('isMuted', (e) => {
      if (e.changing) e.ctx.props.isMuted = e.changing.next;
      e.boolean.current = e.ctx.props.isMuted;
    });
    e.hr();
  })

  .items((e) => {
    e.title('Record');

    e.button('start', (e) => {
      const ref = e.ctx.props.id;
      e.ctx.bus.fire({ type: 'VideoStream/record/start', payload: { ref } });
    });

    e.button('stop (and download)', (e) => {
      const ref = e.ctx.props.id;
      e.ctx.bus.fire({
        type: 'VideoStream/record/stop',
        payload: { ref, download: { filename: 'test' } },
      });
    });

    e.button((config) =>
      config
        .label('stop (and save to cell.fs)')
        .description('target: `localhost:5000/cell:<ns>:A1`')
        .pipe((e) => {
          const ref = e.ctx.props.id;
          e.ctx.bus.fire({
            type: 'VideoStream/record/stop',
            payload: {
              ref,
              data: (file) => {
                /**
                 * TODO 🐷
                 */
                console.log('stream (save to cell)', file);
              },
            },
          });
        }),
    );

    // e.button('stop (and pipe to cell)', (e) => {
    //   const ref = e.ctx.props.id;
    //   e.ctx.bus.fire({
    //     type: 'VideoStream/record/stop',
    //     payload: {
    //       ref,
    //       data: (file) => {
    //         /**
    //          * TODO 🐷
    //          */
    //         console.log('stream (save to cell)', file);
    //       },
    //     },
    //   });
    // });

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
