import React from 'react';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { deleteUndefined } from '../../common';

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
  bus: t.EventBus<t.MediaEvent>;
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
    const bus = rx.bus<t.MediaEvent>();
    const events = VideoStreamEvents({ bus });
    VideoStreamBusController({ bus });
    VideoStreamRecordController({ ref: id, bus });

    rx.payload<t.MediaStreamRecordErrorEvent>(bus.event$, 'MediaStream/record/error')
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

    e.button('fire: MediaStream/start', (e) => {
      const ref = e.ctx.props.id;
      e.ctx.bus.fire({
        type: 'MediaStream/start',
        payload: { ref, constraints: { video: true } },
      });
    });

    e.button('fire: MediaStream/stop [TODO]', (e) => {
      const ref = e.ctx.props.id;
      e.ctx.bus.fire({
        type: 'MediaStream/stop',
        payload: { ref },
      });
    });

    e.hr(1, 0.1);

    e.button('fire: MediaStream/status:req ', async (e) => {
      const ref = e.ctx.props.id;
      const res = await e.ctx.events.status(ref).get();
      const data = {
        ref,
        exists: res.exists,
        constraints: res.constraints,
        tracks: res.tracks,
      };
      const el = <ObjectView data={deleteUndefined(data)} fontSize={10} />;
      e.button.description = el;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Record');

    e.button('start', (e) => {
      const ref = e.ctx.props.id;
      e.ctx.bus.fire({ type: 'MediaStream/record/start', payload: { ref } });
    });

    e.button('stop (and download)', (e) => {
      const ref = e.ctx.props.id;
      e.ctx.bus.fire({
        type: 'MediaStream/record/stop',
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
            type: 'MediaStream/record/stop',
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
