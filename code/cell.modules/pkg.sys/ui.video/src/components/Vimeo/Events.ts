import { takeUntil, filter } from 'rxjs/operators';
import { t, rx } from './common';

/**
 * Event API.
 */
export function VimeoEvents(args: { bus: t.EventBus<any> }): t.VimeoEvents {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.VimeoEvent>(args.bus);
  const is = VimeoEvents.is;

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
VimeoEvents.is = {
  base: matcher('Vimeo/'),
};
