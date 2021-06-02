import { firstValueFrom } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { t, rx, slug } from '../common';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.SystemEvent>(args.bus);
  const $ = bus.$.pipe(takeUntil(dispose$));

  const status = {
    req$: rx.payload<t.SystemStatusReqEvent>($, 'runtime.electron/sys/status:req'),
    res$: rx.payload<t.SystemStatusResEvent>($, 'runtime.electron/sys/status:res'),
    async get() {
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'runtime.electron/sys/status:req', payload: { tx } });
      return (await res).status;
    },
  };

  return {
    dispose,
    dispose$,
    status,
  };
}
