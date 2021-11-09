import React from 'react';
import { filter } from 'rxjs/operators';
import { Filesystem } from 'sys.fs';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { MediaStream, VideoStreamProps } from '..';
import { FileUtil } from '../util';
import { Button, css, cuid, deleteUndefined, log, rx, t } from './common';
import { DevAudioWaveform } from './DEV.AudioWaveform';
import { DevRecordButton } from './DEV.RecordButton';
import { Sample } from './DEV.Sample';

type SaveTarget = 'Fs.IndexedDb' | 'Download';

type Events = ReturnType<typeof MediaStream.Events>;
type Ctx = {
  ref: string;
  bus: t.EventBus<t.MediaEvent>;
  events: Events;
  props: VideoStreamProps;
  muted: { video: boolean; audio: boolean };
  filesystem: {
    id: string;
    store(): Promise<t.Fs>;
  };
  debug: {
    save: { target: SaveTarget };
  };
  action: {
    startVideoStream(): Promise<void>;
    saveVideo(path: string, data: Uint8Array): Promise<void>;
    download(path: string): Promise<void>;
  };
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

    let fs: t.Fs | undefined;
    const fsid = 'fs.video.sample';
    const store = async () => {
      if (fs) return fs;
      const res = await Filesystem.IndexedDb.create({ bus, id: fsid });
      return (fs = res.fs);
    };

    const ctx: Ctx = {
      ref,
      bus,
      events,
      props: { isMuted: true },
      muted: { video: false, audio: false },
      filesystem: { id: fsid, store },

      debug: {
        save: { target: 'Fs.IndexedDb' },
      },

      action: {
        async startVideoStream() {
          await events.stop(ref).fire();
          await events.start(ref).video();
          await updateMute(ctx);
        },

        async saveVideo(path, data) {
          try {
            const fs = await store();
            await fs.write(path, data);
            console.group('🌳 Saved Video to IndexedDb');
            console.log(' - fs(id):', fsid);
            console.log(' - path:', path);
            console.log(' - data', data);
            console.groupEnd();
          } catch (error) {
            console.log('error', error);
          }
        },

        async download() {
          const fs = await store();
          const path = 'my-video.webm';
          const data = await fs.read(path);
          console.group('🌳 Download from IndexedDB Filesystem');
          console.log('path', path);
          console.log('data', data);
          console.groupEnd();
          if (data) {
            const file = new Blob([data], { type: 'video/webm' });
            FileUtil.download(path, file);
          }
        },
      },
    };

    return ctx;
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
      e.ctx.action.startVideoStream();
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

  .items((e) => {
    e.title('Filesystem (IndexedDB)');

    e.select((config) => {
      const targets: SaveTarget[] = ['Fs.IndexedDb', 'Download'];
      config
        .title('Save target storage medium')
        .initial(config.ctx.debug.save.target)
        .view('buttons')
        .items(targets)
        .pipe((e) => {
          const current = e.select.current[0]; // NB: always first.
          e.ctx.debug.save.target = current.value;
        });
    });

    e.hr();
  })

  .subject((e) => {
    const { ref, bus } = e.ctx;
    const { width = 300 } = e.ctx.props;
    const styles = { streamRef: css({ fontSize: 9 }) };
    const elStreamRef = <div {...styles.streamRef}>stream-ref:{ref}</div>;

    const elStartMediastreamButton = (
      <Button onClick={() => e.ctx.action.startVideoStream()}>⚡️ Start</Button>
    );

    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
      actions: { width: 350 },
    });

    e.render(<Sample {...e.ctx.props} streamRef={ref} bus={bus} />, {
      label: {
        topLeft: elStartMediastreamButton,
        topRight: '<VideoStream>',
        bottomRight: elStreamRef,
      },
    });

    e.render(<DevAudioWaveform bus={bus} streamRef={ref} width={width} height={30} />, {
      width,
      background: 1,
      label: 'Audio Waveform',
    });

    const saveTarget = e.ctx.debug.save.target;
    const saveFilename = saveTarget === 'Download' ? 'my-video' : undefined;

    const getPath = () => `${saveFilename ?? 'my-video'}.webm`;
    const elDownload = <Button onClick={() => e.ctx.action.download(getPath())}>Download</Button>;

    e.render(
      <DevRecordButton
        bus={bus}
        streamRef={ref}
        downloadFilename={saveFilename}
        onFileReady={({ data }) => {
          const path = getPath();
          e.ctx.action.saveVideo(path, data);
        }}
      />,
      {
        width,
        background: 1,
        label: { topLeft: '<RecordButton>', bottomRight: elDownload },
      },
    );
  });
export default actions;
