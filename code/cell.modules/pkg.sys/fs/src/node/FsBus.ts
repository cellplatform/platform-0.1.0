import { BusController as Controller } from './FsBus.Controller';
import { BusEvents as Events } from './FsBus.Events';

/**
 * A "filesystem bus" with the [node-js] "config" batteries included.
 */
export const FsBus = {
  Controller,
  Events,
};
