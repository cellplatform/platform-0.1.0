import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil, take } from 'rxjs/operators';

import { rx, slug, t } from './common';

/**
 * Event API.
 */
function Events(args: {
  instance: t.VimeoInstance;
  isEnabled?: boolean;
  dispose$?: t.Observable<any>;
}): t.VimeoEvents {
  const { isEnabled = true } = args;

  const { dispose, dispose$ } = rx.disposable();
  dispose$?.pipe(take(1)).subscribe(() => dispose());

  const bus = rx.busAsType<t.VimeoEvent>(args.instance.bus);
  const is = Events.is;
  const instance = args.instance.id;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => isEnabled),
    filter((e) => is.base(e)),
    filter((e) => e.payload.instance === instance),
  );

  const load: t.VimeoEvents['load'] = {
    req$: rx.payload<t.VimeoLoadReqEvent>($, 'Vimeo/load:req'),
    res$: rx.payload<t.VimeoLoadResEvent>($, 'Vimeo/load:res'),
    async fire(video: t.VimeoId, options = {}) {
      const tx = slug();
      const { timeout: msecs = 1000, muted } = options;
      const first = firstValueFrom(
        load.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Vimeo load timed out after ${msecs} msecs`)),
        ),
      );
      bus.fire({ type: 'Vimeo/load:req', payload: { tx, instance, video, muted } });
      const res = await first;
      return typeof res === 'string' ? { tx, instance, error: res } : res;
    },
  };

  const status: t.VimeoEvents['status'] = {
    $: rx.payload<t.VimeoStatusEvent>($, 'Vimeo/status'),
    req$: rx.payload<t.VimeoStatusReqEvent>($, 'Vimeo/status:req'),
    res$: rx.payload<t.VimeoStatusResEvent>($, 'Vimeo/status:res'),
    async get(options = {}) {
      const tx = slug();
      const { timeout: msecs = 1000 } = options;
      const first = firstValueFrom(
        status.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Vimeo status timed out after ${msecs} msecs`)),
        ),
      );
      bus.fire({ type: 'Vimeo/status:req', payload: { tx, instance } });
      const res = await first;
      return typeof res === 'string' ? { tx, instance, error: res } : res;
    },
  };

  const play: t.VimeoEvents['play'] = {
    req$: rx.payload<t.VimeoPlayReqEvent>($, 'Vimeo/play:req'),
    res$: rx.payload<t.VimeoPlayResEvent>($, 'Vimeo/play:res'),
    async fire(options = {}) {
      const tx = slug();
      const { timeout: msecs = 1000 } = options;
      const first = firstValueFrom(
        play.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Vimeo play timed out after ${msecs} msecs`)),
        ),
      );
      bus.fire({ type: 'Vimeo/play:req', payload: { tx, instance } });
      const res = await first;
      return typeof res === 'string' ? { tx, instance, error: res } : res;
    },
  };

  const pause: t.VimeoEvents['pause'] = {
    req$: rx.payload<t.VimeoPauseReqEvent>($, 'Vimeo/pause:req'),
    res$: rx.payload<t.VimeoPauseResEvent>($, 'Vimeo/pause:res'),
    async fire(options = {}) {
      const tx = slug();
      const { timeout: msecs = 1000 } = options;
      const first = firstValueFrom(
        pause.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Vimeo pause timed out after ${msecs} msecs`)),
        ),
      );
      bus.fire({ type: 'Vimeo/pause:req', payload: { tx, instance } });
      const res = await first;
      return typeof res === 'string' ? { tx, instance, error: res } : res;
    },
  };

  const seek: t.VimeoEvents['seek'] = {
    req$: rx.payload<t.VimeoSeekReqEvent>($, 'Vimeo/seek:req'),
    res$: rx.payload<t.VimeoSeekResEvent>($, 'Vimeo/seek:res'),
    async fire(seconds, options = {}) {
      const tx = slug();
      const { timeout: msecs = 1000 } = options;
      const first = firstValueFrom(
        seek.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Vimeo seek timed out after ${msecs} msecs`)),
        ),
      );
      bus.fire({ type: 'Vimeo/seek:req', payload: { tx, instance, seconds } });
      const res = await first;
      return typeof res === 'string' ? { tx, instance, error: res } : res;
    },
  };

  return {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    is,
    dispose,
    dispose$,
    load,
    status,
    play,
    pause,
    seek,
  };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = { base: matcher('Vimeo/') };

export const VimeoEvents = Events as unknown as t.VimeoEventsFactory;
