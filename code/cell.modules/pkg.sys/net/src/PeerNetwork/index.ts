import { Controller } from './Controller';
import { Events, GroupEvents, NetBus } from './event';
import { PeerStrategy, GroupStrategy } from './Strategy';

export const PeerNetwork = {
  Controller,
  NetBus,

  GroupStrategy,

  Events,
  GroupEvents,
  PeerStrategy,
};
