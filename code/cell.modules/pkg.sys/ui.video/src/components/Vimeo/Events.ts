import { takeUntil, filter } from 'rxjs/operators';
import { t, rx } from './common';

/**
 * Event API.
 */
function Events(args: { bus: t.EventBus<any> }): t.VimeoEvents {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.VimeoEvent>(args.bus);
  const is = Events.is;

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
Events.is = {
  base: matcher('Vimeo/'),
};

export const VimeoEvents = Events as unknown as t.VimeoEventsFactory;
