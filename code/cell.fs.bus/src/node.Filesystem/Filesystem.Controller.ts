import { t, nodefs } from './common';
import { BusController as Controller } from '../web.BusController';
import { FsIndexerLocal, FsDriverLocal } from '@platform/cell.fs.local';

type FilesystemId = string;
type Milliseconds = number;

/**
 * Event controller (node-js).
 */
export function BusController(args: {
  bus: t.EventBus<any>;
  fs: t.FsDriverLocal | string; // String === root directory (if explicit fs-driver not passed).
  id?: FilesystemId;
  index?: t.FsIndexer;
  filter?: (e: t.SysFsEvent) => boolean;
  httpFactory?: (host: string | number) => t.IHttpClient;
  timeout?: Milliseconds;
}) {
  const { bus, id, filter, httpFactory, timeout } = args;

  /**
   * NOTE:
   *      Use the supplied `FsDriver` or create a new instance of the
   *      driver using the [node-js] implementation as the provider.
   */
  const fs = typeof args.fs === 'string' ? FsDriverLocal({ dir: args.fs, fs: nodefs }) : args.fs;

  /**
   * NOTE:
   *      Use the supplied [FsIndexer] or create a new instance of the
   *      indexer using [node-js] implementation as the provider.
   */
  const index = args.index ?? FsIndexerLocal({ dir: fs.dir, fs: nodefs });

  // Finish up.
  return Controller({
    bus,
    id,
    driver: fs,
    index,
    filter,
    httpFactory,
    timeout,
  });
}
