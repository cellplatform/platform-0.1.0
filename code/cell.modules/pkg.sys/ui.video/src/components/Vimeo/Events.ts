import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from './common';

/**
 * Event API.
 */
function Events(args: { id: string; bus: t.EventBus<any> }): t.VimeoEvents {
  const { id } = args;
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.VimeoEvent>(args.bus);
  const is = Events.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
    filter((e) => e.payload.id === id),
  );

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
      bus.fire({ type: 'Vimeo/status:req', payload: { tx, id } });
      const res = await first;
      return typeof res === 'string' ? { tx, id, error: res } : res;
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
      bus.fire({ type: 'Vimeo/play:req', payload: { tx, id } });
      const res = await first;
      return typeof res === 'string' ? { tx, id, error: res } : res;
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
      bus.fire({ type: 'Vimeo/pause:req', payload: { tx, id } });
      const res = await first;
      return typeof res === 'string' ? { tx, id, error: res } : res;
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
      bus.fire({ type: 'Vimeo/seek:req', payload: { tx, id, seconds } });
      const res = await first;
      return typeof res === 'string' ? { tx, id, error: res } : res;
    },
  };

  return { id, $, is, dispose, dispose$, status, play, pause, seek };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = { base: matcher('Vimeo/') };

export const VimeoEvents = Events as unknown as t.VimeoEventsFactory;
