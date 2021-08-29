import { t } from './common';
import { BusController as Controller } from '../web.BusController';
import { FsIndexerLocal, FsDriverLocal } from '@platform/cell.fs.local';
import { fs as node } from '@platform/fs';

type FilesystemId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  bus: t.EventBus<any>;
  id: FilesystemId;
  fs: t.FsDriverLocal | string; // String === root directory (if explicit fs-driver not passed)
  index?: t.FsIndexer;
  filter?: (e: t.SysFsEvent) => boolean;
  httpFactory?: (host: string | number) => t.IHttpClient;
}) {
  const { bus, id, filter, httpFactory } = args;

  /**
   * NOTE:
   *      Use the supplied `FsDriver` or create a new instance of the
   *      driver using the [node-js] implementation as the provider.
   */
  const fs = typeof args.fs === 'string' ? FsDriverLocal({ dir: args.fs, fs: node }) : args.fs;

  /**
   * NOTE:
   *      Use the supplied [FsIndexer] or create a new instance of the
   *      indexer using [node-js] implementation as the provider.
   */
  const index = args.index ?? FsIndexerLocal({ dir: fs.dir, fs: node });

  // Finish up.
  return Controller({
    bus,
    id,
    fs,
    index,
    filter,
    httpFactory,
  });
}
