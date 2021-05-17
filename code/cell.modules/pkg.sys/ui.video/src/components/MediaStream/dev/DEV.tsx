import React from 'react';
import { filter } from 'rxjs/operators';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { MediaStream, VideoStreamProps } from '..';
import { css, cuid, deleteUndefined, HttpClient, log, rx, t } from './common';
import { Sample } from './DEV.Sample';
import { DevAudioWaveform } from './DEV.AudioWaveform';
import { DevRecordButton } from './DEV.RecordButton';

type Events = ReturnType<typeof MediaStream.Events>;
type Ctx = {
  ref: string;
  bus: t.EventBus<t.MediaEvent>;
  events: Events;
  props: VideoStreamProps;
  muted: { video: boolean; audio: boolean };
};

async function updateMute(ctx: Ctx) {
  const { stream } = await ctx.events.status(ctx.ref).get();
  if (stream) {
    stream.media.getAudioTracks().forEach((track) => (track.enabled = !ctx.muted.audio));
    stream.media.getVideoTracks().forEach((track) => (track.enabled = !ctx.muted.video));
  }
}

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.video/MediaStream')
  .context((e) => {
    if (e.prev) return e.prev;

    const ref = cuid();
    const bus = rx.bus<t.MediaEvent>();
    const events = MediaStream.Events(bus);

    MediaStream.Controller({ bus });
    // MediaStream.RecordController({ ref, bus });

    rx.payload<t.MediaStreamErrorEvent>(bus.$, 'MediaStream/error')
      .pipe(filter((e) => e.ref === ref))
      .subscribe((e) => {
        log.info('MediaStream/error:', e);
      });

    return {
      ref,
      bus,
      events,
      props: { isMuted: true },
      muted: { video: false, audio: false },
    };
  })

  .items((e) => {
    e.title('Props');

    e.boolean('video: muted', (e) => {
      if (e.changing) e.ctx.muted.video = e.changing.next;
      e.boolean.current = e.ctx.muted.video;
      updateMute(e.ctx);
    });

    e.boolean('audio: muted', (e) => {
      if (e.changing) e.ctx.muted.audio = e.changing.next;
      e.boolean.current = e.ctx.muted.audio;
      updateMute(e.ctx);
    });

    e.hr(1, 0.1);

    e.button('update mute', (e) => updateMute(e.ctx));

    e.hr();
  })

  .items((e) => {
    e.title('Get Started');

    e.hr(1, 0.1);

    e.button('fire ⚡️ MediaStream/start (video)', async (e) => {
      const ref = e.ctx.ref;
      await e.ctx.events.stop(ref).fire();
      await e.ctx.events.start(ref).video();
      await updateMute(e.ctx);
    });

    e.button('fire ⚡️ MediaStream/start (screen)', async (e) => {
      const ref = e.ctx.ref;
      await e.ctx.events.stop(ref).fire();
      await e.ctx.events.start(ref).screen();
      await updateMute(e.ctx);
    });

    e.button('fire ⚡️ MediaStream/stop', (e) => {
      const ref = e.ctx.ref;
      e.ctx.bus.fire({ type: 'MediaStream/stop', payload: { ref } });
    });

    e.hr(1, 0.1);

    e.button('fire ⚡️ MediaStream/status:req', async (e) => {
      const ref = e.ctx.ref;
      const data = deleteUndefined(await e.ctx.events.status(ref).get());
      const name = 'response: status';
      e.button.description = <ObjectView name={name} data={data} fontSize={10} expandLevel={3} />;
    });

    e.button('fire ⚡️ MediaStreams/status:req (all)', async (e) => {
      const data = deleteUndefined(await e.ctx.events.all.status().get());
      const name = 'response: status (all)';
      e.button.description = <ObjectView name={name} data={data} fontSize={10} expandLevel={3} />;
    });

    e.hr(1, 0.1);

    e.button('fire ⚡️ MediaStreams/record/status:req', async (e) => {
      const ref = e.ctx.ref;
      const data = deleteUndefined(await e.ctx.events.record(ref).status.get());
      const name = 'response: recording';
      e.button.description = <ObjectView name={name} data={data} fontSize={10} expandLevel={3} />;
    });

    e.hr();
  })

  // .items((e) => {
  //   e.title('Record');

  //   e.button('start', (e) => {
  //     const ref = e.ctx.ref;
  //     e.ctx.bus.fire({ type: 'MediaStream/record/start', payload: { ref } });
  //   });

  //   e.button('stop (and download)', (e) => {
  //     const ref = e.ctx.ref;
  //     e.ctx.bus.fire({
  //       type: 'MediaStream/record/stop',
  //       payload: { ref, download: { filename: 'test' } },
  //     });
  //   });

  //   e.button((config) =>
  //     config
  //       .label('stop (and save to cell.fs)')
  //       .description('target: `host/cell:<ns>:A1`')
  //       .pipe((e) => {
  //         return new Promise<void>((resolve, reject) => {
  //           const ref = e.ctx.ref;
  //           e.ctx.bus.fire({
  //             type: 'MediaStream/record/stop',
  //             payload: {
  //               ref,
  //               data: async (file) => {
  //                 // const host = 5000;
  //                 const host = 'https://os.ngrok.io';

  //                 const client = HttpClient.create(host);
  //                 const cell = client.cell('cell:ckm8fe8o0000d9reteimz8y7v:A1');
  //                 const filename = 'tmp/record.webm';
  //                 const data = await file.arrayBuffer();
  //                 const res = await cell.fs.upload({ filename, data });

  //                 console.log('HTTP Response', res);
  //                 console.log('OK', res.ok);
  //                 const url = cell.url.file.byName(filename).toString();
  //                 console.log('Saved to:', url);

  //                 const md = `recorded file [download](${url})`;
  //                 e.button.description = md;
  //                 resolve();
  //               },
  //             },
  //           });
  //         });
  //       }),
  //   );

  //   e.hr();
  // })

  .subject((e) => {
    const { ref, bus } = e.ctx;
    const { width = 300 } = e.ctx.props;
    const styles = { streamRef: css({ fontSize: 9 }) };
    const elStreamRef = <div {...styles.streamRef}>stream-ref:{ref}</div>;

    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
      actions: { width: 350 },
    });

    e.render(<Sample {...e.ctx.props} streamRef={ref} bus={bus} />, {
      label: { topLeft: '<VideoStream>', bottomRight: elStreamRef },
    });

    e.render(<DevAudioWaveform bus={bus} streamRef={ref} width={width} height={30} />, {
      width,
      background: 1,
      label: 'Audio Waveform',
    });

    e.render(<DevRecordButton bus={bus} streamRef={ref} />, {
      width,
      background: 1,
      label: '<RecordButton>',
    });
  });
export default actions;
