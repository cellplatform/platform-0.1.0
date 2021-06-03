import { takeUntil, filter } from 'rxjs/operators';
import { t, rx } from '../common';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.NameEvent>(args.bus);

  const is = {
    base: (input: any) => rx.isEvent(input, { startsWith: 'namespace/' }),
  };

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  return { $, is, dispose, dispose$ };
}
