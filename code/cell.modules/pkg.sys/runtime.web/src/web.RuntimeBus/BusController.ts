import { DEFAULT, rx, slug, t, WebRuntime } from './common';
import { BusEvents } from './BusEvents';

type InstanceId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  id?: InstanceId;
  fs: t.Fs;
  bus: t.EventBus<any>;
  filter?: (e: t.WebRuntimeEvent) => boolean;
}) {
  const { fs } = args;
  const id = args.id ?? DEFAULT.id;

  const bus = rx.busAsType<t.WebRuntimeEvent>(args.bus);
  const events = BusEvents({ id, bus });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx = slug() } = e;

    const version = WebRuntime.module.version;
    const info: t.WebRuntimeInfo = { version };

    bus.fire({
      type: 'sys.runtime.web/info:res',
      payload: { tx, id, info },
    });
  });

  /**
   * API
   */
  return { dispose, dispose$, id, events };
}
