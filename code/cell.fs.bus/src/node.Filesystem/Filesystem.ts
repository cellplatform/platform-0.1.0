import { t, rx, nodefs } from '../node/common';
import { BusController as Controller } from './Filesystem.Controller';
import { BusEvents as Events } from './Filesystem.Events';

type Milliseconds = number;

/**
 * A "filesystem bus" with the [node-js] "config" batteries included.
 */
export const Filesystem = {
  Controller,
  Events,

  /**
   * Create a filesystem store with minimal parameters using [node-js].
   */
  create(args: { dir: string; bus?: t.EventBus<any>; timeout?: Milliseconds }) {
    const { timeout } = args;
    const bus = args.bus ?? rx.bus();
    const dir = args.dir.startsWith('/') ? args.dir : nodefs.resolve(args.dir);
    const store = Filesystem.Controller({ bus, driver: dir, timeout });
    const fs = store.fs({ timeout });
    return { bus, store, fs };
  },
};
