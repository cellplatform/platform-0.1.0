import { BusController as Controller } from '../web.BusController';
import { BusEvents as Events } from '../web.BusEvents';

/**
 * File-system Bus.
 * An event bus driven, platform agnostic, file-system interface.
 */
export const FsBus = {
  Controller,
  Events,
};
