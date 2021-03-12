import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { R, rx, t } from '../../common';

/**
 * Manages an event bus dealing with video stream.
 */
export function VideoStreamBusController(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  const bus = args.bus.type<t.VideoEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  /**
   * Connect to local-device media (camera/audio).
   */
  rx.payload<t.VideoStreamGetMediaEvent>($, 'VideoStream/getMedia')
    .pipe()
    .subscribe(async (e) => {
      type M = MediaStreamConstraints;
      const base: M = {
        video: true,
        audio: { echoCancellation: { ideal: true } },
      };
      const constraints = R.mergeDeepRight(base, e.constraints || {}) as M;
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      bus.fire({
        type: 'VideoStream/media',
        payload: { ref: e.ref, stream },
      });
    });

  return {
    dispose$: dispose$.asObservable(),
    dispose,
  };
}
