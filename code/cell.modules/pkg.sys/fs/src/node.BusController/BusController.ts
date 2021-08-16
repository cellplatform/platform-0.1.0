import { BusEvents, DEFAULT, rx, slug, t } from './common';

type FilesystemId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  id: FilesystemId;
  fs: t.IFsLocal;
  bus: t.EventBus<any>;
  filter?: (e: t.SysFsEvent) => boolean;
}) {
  const { id, fs } = args;

  const bus = rx.busAsType<t.SysFsEvent>(args.bus);
  const events = BusEvents({ id, bus, filter: args.filter });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe((e) => {
    const { tx = slug() } = e;

    const info: t.SysFsInfo = {
      id,
      dir: fs.dir,
    };

    bus.fire({
      type: 'sys.fs/info:res',
      payload: { tx, id, info },
    });
  });

  return { dispose, dispose$ };
}
