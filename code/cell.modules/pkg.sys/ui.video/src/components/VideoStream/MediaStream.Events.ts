import { Subject, firstValueFrom } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { rx, t } from '../../common';

/**
 * Helpers for working with <VideoStream> events.
 */
export function MediaStreamEvents(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.bus.type<t.MediaStreamEvent>();
  const event$ = bus.event$.pipe(takeUntil(dispose$));

  return {
    dispose,
    dispose$: dispose$.asObservable(),

    started(ref: string) {
      const $ = rx
        .payload<t.MediaStreamStartedEvent>(event$, 'MediaStream/started')
        .pipe(filter((e) => e.ref === ref));
      return { ref, $ };
    },

    status(ref: string) {
      const request$ = rx
        .payload<t.MediaStreamStatusRequestEvent>(event$, 'MediaStream/status:req')
        .pipe(filter((e) => e.ref === ref));
      const response$ = rx
        .payload<t.MediaStreamStatusResponseEvent>(event$, 'MediaStream/status:res')
        .pipe(filter((e) => e.ref === ref));

      const get = () => {
        const res = firstValueFrom(response$);
        bus.fire({ type: 'MediaStream/status:req', payload: { ref } });
        return res;
      };

      return { ref, get, request$, response$ };
    },
  };
}
