import { BusEvents, DEFAULT, rx, slug, t } from './common';

type Instance = string;

/**
 * Event controller.
 */
export function BusController(args: {
  id?: Instance;
  fs: t.Fs;
  bus: t.EventBus<any>;
  filter?: (e: t.VercelEvent) => boolean;
  version?: number;
}) {
  const { version = DEFAULT.version, fs } = args;
  const id = args.id ?? DEFAULT.id;
  const bus = rx.busAsType<t.VercelEvent>(args.bus);
  const events = BusEvents({ id, bus, filter: args.filter });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe((e) => {
    const { tx = slug() } = e;
    const info: t.VercelInfo = { endpoint: { version } };

    bus.fire({
      type: 'vendor.vercel/info:res',
      payload: { tx, id, info },
    });
  });

  /**
   * API
   */
  return { dispose, dispose$, id, events };
}
