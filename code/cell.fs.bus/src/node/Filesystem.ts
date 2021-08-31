import { BusController as Controller } from './Filesystem.Controller';
import { BusEvents as Events } from './Filesystem.Events';

/**
 * A "filesystem bus" with the [node-js] "config" batteries included.
 */
export const Filesystem = {
  Controller,
  Events,
};
