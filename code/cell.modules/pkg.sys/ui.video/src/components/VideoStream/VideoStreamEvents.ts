import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { rx, t } from '../../common';

/**
 * Helpers for working with VideoStream events.
 */
export function VideoStreamEvents(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.bus.type<t.VideoStreamEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  const res = {
    dispose,
    dispose$: dispose$.asObservable(),

    streamCreated(ref: string) {
      return rx
        .payload<t.VideoStreamCreatedEvent>($, 'VideoStream/created')
        .pipe(filter((e) => e.ref === ref));
    },

    onStreamCreated(ref: string, callback: (stream: MediaStream) => void) {
      res
        .streamCreated(ref)
        .pipe(take(1))
        .subscribe((e) => callback(e.stream));
    },
  };

  return res;
}
