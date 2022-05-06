import { t, DEFAULT } from './common';
import { Filesystem as FilesystemWeb } from '@platform/cell.fs.bus/lib/web';
import { FsDriverLocal } from '../web.FsDriver.IndexedDb';

type FilesystemId = string;
type Milliseconds = number;

/**
 * Event controller (IndexedDB).
 */
export async function BusController(args: {
  bus: t.EventBus<any>;
  id: FilesystemId;
  filter?: (e: t.SysFsEvent) => boolean;
  httpFactory?: (host: string | number) => t.IHttpClient;
  timeout?: Milliseconds;
  dispose$?: t.Observable<any>;
}) {
  const { bus, filter, httpFactory, timeout } = args;
  const id = (args.id ?? '').trim() || DEFAULT.FILESYSTEM_ID;

  // Start the driver.
  const local = await FsDriverLocal({ id });
  const { driver, index } = local;

  // Start the EventBus controller.
  const store = FilesystemWeb.Controller({
    bus,
    id,
    driver,
    index,
    filter,
    httpFactory,
    timeout,
  });

  // Finish up.
  args.dispose$?.subscribe(() => store.dispose());
  return store;
}
