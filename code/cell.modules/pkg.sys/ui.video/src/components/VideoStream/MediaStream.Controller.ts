import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { R, rx, t } from '../../common';

type M = MediaStreamConstraints;
type Refs = { [ref: string]: Ref };
type Ref = { ref: string; stream: MediaStream; constraints: M };

/**
 * Manages an event bus dealing with video stream.
 */
export function MediaStreamController(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const bus = args.bus.type<t.MediaEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));
  const refs: Refs = {};

  /**
   * STATUS
   */
  rx.payload<t.MediaStreamStatusRequestEvent>($, 'MediaStream/status:req')
    .pipe()
    .subscribe((e) => {
      const { ref } = e;
      const item = refs[ref];
      const exists = Boolean(item);
      const stream = item?.stream;
      const constraints = item?.constraints;
      const tracks = toTracks(item?.stream);
      bus.fire({
        type: 'MediaStream/status:res',
        payload: { ref, exists, stream, constraints, tracks },
      });
    });

  /**
   * START Connect to local-device media (camera/audio).
   */
  rx.payload<t.MediaStreamStartEvent>($, 'MediaStream/start')
    .pipe()
    .subscribe(async (e) => {
      const { ref } = e;

      if (!refs[ref]) {
        const base: M = {
          video: true,
          audio: { echoCancellation: { ideal: true } },
        };
        const constraints = R.mergeDeepRight(base, e.constraints || {}) as M;
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        refs[ref] = { ref, stream, constraints };
      }

      const { stream } = refs[ref];

      bus.fire({
        type: 'MediaStream/started',
        payload: { ref, stream },
      });
    });

  /**
   * STOP
   */
  rx.payload<t.MediaStreamStopEvent>($, 'MediaStream/stop')
    .pipe()
    .subscribe((e) => {
      const { ref } = e;
      const stream = refs[ref]?.stream;
      delete refs[ref];

      (stream?.getTracks() || []).forEach((track) => track.stop());
      const tracks = toTracks(stream);

      bus.fire({
        type: 'MediaStream/stopped',
        payload: { ref, tracks },
      });
    });

  return {
    dispose$: dispose$.asObservable(),
    dispose() {
      dispose$.next();
      Object.keys(refs).forEach((key) => delete refs[key]);
    },
  };
}

/**
 * [Helpers]
 */

function toTracks(stream?: MediaStream) {
  return (stream?.getTracks() || []).map(toTrack);
}

function toTrack(input: MediaStreamTrack): t.MediaStreamTrack {
  const { id, enabled: isEnabled, muted: isMuted, label, readyState: state } = input;
  const kind = input.kind as t.MediaStreamTrack['kind'];
  return { kind, id, isEnabled, isMuted, label, state };
}
