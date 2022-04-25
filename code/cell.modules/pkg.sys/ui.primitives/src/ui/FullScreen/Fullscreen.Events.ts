import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from './common';

export type FullscreenEventsArgs = {
  instance: t.FullscreenInstance;
  dispose$?: t.Observable<void>;
};

export function FullscreenEvents(args: FullscreenEventsArgs): t.FullscreenEvents {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);
  const bus = rx.busAsType<t.FullscreenEvent>(args.instance.bus);
  const instance = args.instance.id;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.Fullscreen/')),
    filter((e) => e.payload.instance === instance),
  );

  const enter: t.FullscreenEvents['enter'] = {
    req$: rx.payload<t.FullscreenEnterReqEvent>($, 'sys.ui.Fullscreen/enter:req'),
    res$: rx.payload<t.FullscreenEnterResEvent>($, 'sys.ui.Fullscreen/enter:res'),
    async fire(options = {}) {
      const { timeout = 1000 } = options;
      const tx = slug();

      const op = 'enter';
      const res$ = enter.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.FullscreenEnterResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.ui.Fullscreen/enter:req',
        payload: { tx, instance },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance: instance, error };
    },
  };

  const exit: t.FullscreenEvents['exit'] = {
    req$: rx.payload<t.FullscreenExitReqEvent>($, 'sys.ui.Fullscreen/exit:req'),
    res$: rx.payload<t.FullscreenExitResEvent>($, 'sys.ui.Fullscreen/exit:res'),
    async fire(options = {}) {
      const { timeout = 1000 } = options;
      const tx = slug();

      const op = 'exit';
      const res$ = enter.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.FullscreenExitResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.ui.Fullscreen/exit:req',
        payload: { tx, instance },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance: instance, error };
    },
  };

  return {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    dispose,
    dispose$,
    enter,
    exit,
  };
}
