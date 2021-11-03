import { t } from './common';
import { Filesystem as FilesystemWeb } from '@platform/cell.fs.bus/lib/web';
import { FsDriverLocal } from '../web.FsDriver.IndexedDb';

type FilesystemId = string;
type Milliseconds = number;

/**
 * Event controller (IndexedDB).
 */
export async function BusController(args: {
  bus: t.EventBus<any>;
  name?: string;
  id?: FilesystemId;
  filter?: (e: t.SysFsEvent) => boolean;
  httpFactory?: (host: string | number) => t.IHttpClient;
  timeout?: Milliseconds;
}) {
  const { name, bus, id, filter, httpFactory, timeout } = args;

  // Start the driver.
  const fs = await FsDriverLocal({ name });
  const { driver, index } = fs;

  // Finish up.
  return FilesystemWeb.Controller({
    bus,
    id,
    driver,
    index,
    filter,
    httpFactory,
    timeout,
  });
}
