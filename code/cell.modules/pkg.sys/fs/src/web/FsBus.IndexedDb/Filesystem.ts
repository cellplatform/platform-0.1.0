import { rx, t, DEFAULT } from './common';
import { Filesystem as Web } from '@platform/cell.fs.bus/lib/web';
import { BusController as Controller } from './Filesystem.Controller';
import { NetworkController as Network } from './Filesystem.Controller.Network';

type Milliseconds = number;
type FilesystemId = string;

/**
 * A "filesystem bus" with the [IndexedDB] "config" batteries included.
 */
export const Filesystem = {
  Controller,
  Network,
  Events: Web.Events,

  /**
   * Create a filesystem store with minimal parameters using [IndexedDB].
   */
  async create(
    options: {
      bus?: t.EventBus<any>;
      id?: FilesystemId;
      timeout?: Milliseconds;
      dispose$?: t.Observable<any>;
    } = {},
  ) {
    const { timeout, dispose$ } = options;
    const bus = options.bus ?? rx.bus();
    const id = (options.id ?? '').trim() || DEFAULT.FILESYSTEM_ID;
    const store = await Controller({ fs: id, bus, timeout, dispose$ });
    const fs = store.fs({ timeout });
    return { id, bus, store, fs };
  },
};
