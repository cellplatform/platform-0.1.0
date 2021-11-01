import { rx, t } from './common';
import { Filesystem as Web } from '@platform/cell.fs.bus/lib/web';
import { BusController as Controller } from './Filesystem.Controller';

type Milliseconds = number;

/**
 * A "filesystem bus" with the [IndexedDB] "config" batteries included.
 */
export const Filesystem = {
  Controller,
  Events: Web.Events,

  /**
   * Create a filesystem store with minimal parameters using [IndexedDB].
   */
  async create(options: { bus?: t.EventBus<any>; name?: string; timeout?: Milliseconds } = {}) {
    const { timeout, name } = options;
    const bus = options.bus ?? rx.bus();
    const store = await Controller({ bus, name, timeout });
    const fs = store.fs({ timeout });
    return { bus, store, fs };
  },
};
