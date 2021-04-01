import { Subject, firstValueFrom } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, t } from '../../common';

/**
 * Helpers for working with <VideoStream> events.
 */
export function MediaStreamEvents(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.bus.type<t.MediaStreamEvent | t.MediaStreamsEvent>();
  const event$ = bus.event$.pipe(takeUntil(dispose$));

  /**
   * START
   */
  const start = (ref: string) => {
    const video$ = rx
      .payload<t.MediaStreamStartVideoEvent>(event$, 'MediaStream/start:video')
      .pipe(filter((e) => e.ref === ref));

    const screen$ = rx
      .payload<t.MediaStreamStartScreenEvent>(event$, 'MediaStream/start:screen')
      .pipe(filter((e) => e.ref === ref));

    type V = t.MediaStreamStartVideoEvent | t.MediaStreamStartScreenEvent;
    const fire = (type: V['type']) => {
      const res = firstValueFrom(started(ref).$);
      bus.fire({ type, payload: { ref } });
      return res;
    };

    return {
      ref,
      video$,
      screen$,
      video: () => fire('MediaStream/start:video'),
      screen: () => fire('MediaStream/start:screen'),
    };
  };

  const started = (ref: string) => {
    const $ = rx
      .payload<t.MediaStreamStartedEvent>(event$, 'MediaStream/started')
      .pipe(filter((e) => e.ref === ref));
    return { ref, $ };
  };

  /**
   * STOP
   */
  const stop = (ref: string) => {
    const $ = rx
      .payload<t.MediaStreamStopEvent>(event$, 'MediaStream/stop')
      .pipe(filter((e) => e.ref === ref));

    const fire = () => {
      const res = firstValueFrom(stopped(ref).$);
      bus.fire({ type: 'MediaStream/stop', payload: { ref } });
      return res;
    };

    return { ref, $, fire };
  };

  const stopped = (ref: string) => {
    const $ = rx
      .payload<t.MediaStreamStoppedEvent>(event$, 'MediaStream/stopped')
      .pipe(filter((e) => e.ref === ref));
    return { ref, $ };
  };

  /**
   * STATUS
   */
  const status = (ref: string) => {
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
  };

  const all = {
    status() {
      const request$ = rx
        .payload<t.MediaStreamsStatusRequestEvent>(event$, 'MediaStreams/status:req')
        .pipe();
      const response$ = rx
        .payload<t.MediaStreamsStatusResponseEvent>(event$, 'MediaStreams/status:res')
        .pipe();

      const get = (kind?: t.MediaStreamKind) => {
        const res = firstValueFrom(response$);
        bus.fire({ type: 'MediaStreams/status:req', payload: { kind } });
        return res;
      };

      return { get, request$, response$ };
    },
  };

  return {
    dispose,
    dispose$: dispose$.asObservable(),
    start,
    started,
    stop,
    stopped,
    status,
    all,
  };
}
