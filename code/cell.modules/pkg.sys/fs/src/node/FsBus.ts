import { BusController as Controller } from './FsBus.Controller';
import { BusEvents as Events } from './FsBus.Events';

/**
 * File-system Bus.
 * An event bus driven, platform agnostic, file-system interface.
 */
export const FsBus = {
  Controller,
  Events,
};
