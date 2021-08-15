import { BusEvents, DEFAULT, rx, slug, t } from './common';

/**
 * Event controller.
 */
export function BusController(args: {
  bus: t.EventBus<any>;
  filter?: (e: t.SysFsEvent) => boolean;
}) {
  const bus = rx.busAsType<t.SysFsEvent>(args.bus);
  const events = BusEvents({ bus, filter: args.filter });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe((e) => {
    const { tx = slug() } = e;

    const info: t.SysFsInfo = {
      //
    };

    bus.fire({
      type: 'sys.fs/info:res',
      payload: { tx, info },
    });
  });

  return { dispose, dispose$ };
}
