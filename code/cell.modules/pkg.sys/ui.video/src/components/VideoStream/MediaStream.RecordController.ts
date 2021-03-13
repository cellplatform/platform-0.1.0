import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { R, rx, t, time } from '../../common';
import { MediaStreamEvents } from './MediaStream.Events';

type M = 'video/webm';

/**
 * Manages recording a video stream (via the given stream "ref" identifier).
 */
export function MediaStreamRecordController(args: { ref: string; bus: t.EventBus<any> }) {
  const { ref } = args;
  const dispose$ = new Subject<void>();
  const bus = args.bus.type<t.MediaStreamRecordEvent>();
  const events = MediaStreamEvents({ bus });
  const $ = bus.event$.pipe(takeUntil(dispose$));

  let stream: MediaStream | undefined;
  let recorder: ReturnType<typeof Recorder> | undefined;

  /**
   * TODO 🐷
   * - pause/resume
   * - download
   * - purge
   */

  const error = (error: string) => {
    bus.fire({
      type: 'MediaStream/record/error',
      payload: { ref, error },
    });
  };

  /**
   * Catch the referenced stream.
   */
  events.started(ref).$.subscribe((e) => (stream = e.stream));

  /**
   * Start recording.
   */
  rx.payload<t.MediaStreamRecordStartEvent>($, 'MediaStream/record/start')
    .pipe(filter((e) => e.ref === ref))
    .subscribe((e) => {
      if (!stream) {
        const message = `Cannot start recording as a media stream has not been created yet.`;
        return error(message);
      }

      if (recorder) {
        return error(`A video recorder for the stream is already in progress.`);
      }

      const { mimetype = 'video/webm' } = e;

      recorder = Recorder({ stream, mimetype }).start();
      bus.fire({ type: 'MediaStream/record/started', payload: e });
    });

  /**
   * Stop recording.
   */
  rx.payload<t.MediaStreamRecordStopEvent>($, 'MediaStream/record/stop')
    .pipe(filter((e) => e.ref === ref))
    .subscribe(async (e) => {
      const { ref } = e;

      if (!recorder) {
        return error(`Cannot stop recording stream as it has not yet been started.`);
      }

      const blob = await recorder.stop();
      if (e.download) downloadFile(e.download.filename, blob);
      if (e.data) e.data(blob);

      bus.fire({
        type: 'MediaStream/record/stopped',
        payload: { ref, file: blob },
      });

      recorder = undefined;
    });

  return {
    dispose$: dispose$.asObservable(),
    dispose: () => dispose$.next(),
  };
}

/**
 * A wrapper around the [MediaRecorder] api.
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
 */
function Recorder(args: { stream: MediaStream; mimetype: M }) {
  const { stream, mimetype } = args;
  const chunks: Blob[] = [];

  const recorder = new MediaRecorder(stream, { mimeType: mimetype });
  recorder.ondataavailable = (e) => chunks.push(e.data);

  const res = {
    stream,
    mimetype,
    isStopped: false,

    get blob() {
      return new Blob(chunks, { type: mimetype });
    },

    start() {
      recorder.start();
      return res;
    },

    stop() {
      res.isStopped = true;
      return new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(res.blob);
        recorder.stop();
      });
    },
  };

  return res;
}

/**
 * Initiates a file download.
 */
function downloadFile(filename: string, blob: Blob) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  time.delay(100, () => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  });
}
