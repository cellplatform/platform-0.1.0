import { Observable, timeout } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../common';

type E = t.FullscreenEvent;

/**
 * EventBus interface for the Fullscreen API.
 *
 * See:
 *    WebStandard: Fullscreen API
 *    https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 *
 *    Spec:
 *    https://fullscreen.spec.whatwg.org
 */
export function FullscreenEvents(args: {
  instance?: t.FullscreenInstance;
  dispose$?: t.Observable<void>;
}): t.FullscreenEvents {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);
  const bus = args.instance ? rx.busAsType<E>(args.instance.bus) : rx.bus<E>(); // NB dummy.
  const instance = args.instance?.id ?? '';

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.Fullscreen/')),
    filter((e) => e.payload.instance === instance),
  );

  const fire = (e: t.FullscreenEvent) => bus.fire(e);

  const status: t.FullscreenEvents['status'] = {
    req$: rx.payload<t.FullscreenStatusReqEvent>($, 'sys.ui.Fullscreen/Status:req'),
    res$: rx.payload<t.FullscreenStatusResEvent>($, 'sys.ui.Fullscreen/Status:res'),
    async get(options = {}) {
      const { timeout = 1000 } = options;
      const tx = slug();

      const op = 'status';
      const res$ = status.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.FullscreenEnterResEvent>(res$, { op, timeout });

      fire({
        type: 'sys.ui.Fullscreen/Status:req',
        payload: { tx, instance },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance: instance, error };
    },
  };

  const enter: t.FullscreenEvents['enter'] = {
    req$: rx.payload<t.FullscreenEnterReqEvent>($, 'sys.ui.Fullscreen/Enter:req'),
    res$: rx.payload<t.FullscreenEnterResEvent>($, 'sys.ui.Fullscreen/Enter:res'),
    async fire(options = {}) {
      const { timeout = 1000 } = options;
      const tx = slug();

      const op = 'enter';
      const res$ = enter.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.FullscreenEnterResEvent>(res$, { op, timeout });

      fire({
        type: 'sys.ui.Fullscreen/Enter:req',
        payload: { tx, instance },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance: instance, error };
    },
  };

  const exit: t.FullscreenEvents['exit'] = {
    req$: rx.payload<t.FullscreenExitReqEvent>($, 'sys.ui.Fullscreen/Exit:req'),
    res$: rx.payload<t.FullscreenExitResEvent>($, 'sys.ui.Fullscreen/Exit:res'),
    async fire(options = {}) {
      const { timeout = 1000 } = options;
      const tx = slug();

      const op = 'exit';
      const res$ = enter.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.FullscreenExitResEvent>(res$, { op, timeout });

      fire({
        type: 'sys.ui.Fullscreen/Exit:req',
        payload: { tx, instance },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance: instance, error };
    },
  };

  const changed: t.FullscreenEvents['changed'] = {
    $: rx.payload<t.FullscreenChangedEvent>($, 'sys.ui.Fullscreen/Changed'),
    fire(isFullscreen) {
      fire({
        type: 'sys.ui.Fullscreen/Changed',
        payload: { instance, isFullscreen },
      });
    },
  };

  return {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    status,
    changed,
    dispose,
    dispose$,
    fire,
    enter,
    exit,
  };
}
