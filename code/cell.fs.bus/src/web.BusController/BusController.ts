import { BusControllerCell } from './BusController.Cell';
import { BusControllerIndexer } from './BusController.Indexer';
import { BusControllerIo } from './BusController.Io';
import { BusEvents, HttpClient, rx, t, cuid } from './common';

type FilesystemId = string;
type Milliseconds = number;

/**
 * Event controller (web).
 */
export function BusController(args: {
  bus: t.EventBus<any>;
  id?: FilesystemId;
  fs: t.FsDriverLocal;
  index: t.FsIndexer;
  filter?: (e: t.SysFsEvent) => boolean;
  httpFactory?: (host: string | number) => t.IHttpClient;
  timeout?: Milliseconds;
}) {
  const { fs, index, timeout } = args;
  const id = args.id || `fs-${cuid()}`;

  const bus = rx.busAsType<t.SysFsEvent>(args.bus);
  const events = BusEvents({ id, bus, timeout, filter: args.filter });
  const { dispose, dispose$ } = events;

  const httpFactory = (host: string | number) =>
    args.httpFactory?.(host) ?? HttpClient.create(host);

  /**
   * Sub-controllers.
   */
  BusControllerIo({ id, fs, bus, events });
  BusControllerIndexer({ id, fs, bus, events, index });
  BusControllerCell({ id, fs, bus, events, index, httpFactory });

  /**
   * API
   */
  const dir = fs.dir;
  return {
    id,
    dir,
    dispose,
    dispose$,
    events,
    fs: events.fs,
  };
}
