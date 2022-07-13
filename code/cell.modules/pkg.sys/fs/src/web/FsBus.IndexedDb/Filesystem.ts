import { Filesystem as Web } from '@platform/cell.fs.bus/lib/web';

import { BusController as Controller } from './Filesystem.Controller';
import { NetworkController as Network } from './Filesystem.Controller.Network';
import { create } from './Filesystem.create';

/**
 * A "filesystem bus" with the [IndexedDB] "config" batteries included.
 */
export const Filesystem = {
  Controller,
  Network,
  Events: Web.Events,
  create,
};
