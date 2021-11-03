import { BusEvents as Events } from './BusEvents';
import { BusController as Controller } from './BusController';
import { GroupEvents } from './GroupEvents';

export * from './BusEvents';

export const WebRuntimeBus = {
  Events,
  GroupEvents,
  Controller,
};
