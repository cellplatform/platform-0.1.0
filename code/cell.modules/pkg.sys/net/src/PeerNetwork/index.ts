import { Controller } from './Controller';
import { Events, GroupEvents, NetBus } from './event';
import { GroupStrategy, PeerStrategy } from './strategy';

export const PeerNetwork = {
  Controller,
  NetBus,

  GroupStrategy,

  Events,
  GroupEvents,
  PeerStrategy,
};
