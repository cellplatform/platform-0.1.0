import { takeUntil, filter } from 'rxjs/operators';
import { t, rx } from './common';
import { EventBus } from '@platform/types';

/**
 * Event API.
 */
export function BusEvents(args: { bus: EventBus<any> }) {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.VercelEvent>(args.bus);
  const is = BusEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  return { $, is, dispose, dispose$ };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('http.vercel/'),
};
