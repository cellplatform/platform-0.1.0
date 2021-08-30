import { BusController as Controller } from '../web.BusController';
import { BusEvents as Events } from '../web.BusEvents';

/**
 * Filesystem Bus.
 * An event bus driven, platform agnostic, filesystem interface.
 */
export const FsBus = {
  Controller,
  Events,
};
