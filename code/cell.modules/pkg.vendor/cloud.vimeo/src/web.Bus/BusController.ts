import { DEFAULT, rx, slug, t } from './common';
import { BusEvents } from './BusEvents';

type InstanceId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  token: string;
  id?: InstanceId;
  fs: t.Fs;
  bus: t.EventBus<any>;
  filter?: (e: t.VimeoEvent) => boolean;
}) {
  const { token, fs } = args;
  const id = args.id ?? DEFAULT.id;

  const bus = rx.busAsType<t.VimeoEvent>(args.bus);
  const events = BusEvents({ id, bus });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx = slug() } = e;

    const info: t.VimeoInfo = { api: { version: '3.4' } };

    bus.fire({
      type: 'vendor.vimeo/info:res',
      payload: { tx, id, info },
    });
  });

  /**
   * API
   */
  return { dispose, dispose$, id, events };
}
