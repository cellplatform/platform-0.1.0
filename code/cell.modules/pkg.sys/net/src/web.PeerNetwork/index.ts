import { Controller } from './Controller';
import { PeerEvents, GroupEvents } from '../web.PeerNetwork.events';
import { PeerGroupStrategy, PeerStrategy } from './strategy';

export const PeerNetwork = {
  Controller,

  GroupStrategy: PeerGroupStrategy,
  PeerStrategy,

  PeerEvents,
  GroupEvents: GroupEvents,
};
