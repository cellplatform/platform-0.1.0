import { Filesystem } from '@platform/cell.fs.bus/lib/web';

import { DEFAULT, rx, t } from './common';
import { BusController } from './Filesystem.Controller';

/**
 * A "filesystem bus" with the [IndexedDB] configuration "batteries included".
 */
export const create: t.FilesystemCreate = (options = {}) => {
  const { timeout } = options;
  const { dispose$, dispose } = rx.disposable(options.dispose$);

  const bus = options.bus ?? rx.bus();
  const id = (options.fs ?? '').trim() || DEFAULT.FILESYSTEM_ID;

  const controller = BusController({ fs: id, bus, timeout, dispose$ });
  const events = Filesystem.Events({ bus, id, dispose$ });
  const fs = events.fs({ timeout });

  const ready = async () => {
    const store = await controller;
    return { ...api, store };
  };

  const api: t.FilesystemCreateResponse = {
    id,
    bus,
    fs,
    events,
    dispose$,
    dispose,
    ready,
  };

  return api;
};
