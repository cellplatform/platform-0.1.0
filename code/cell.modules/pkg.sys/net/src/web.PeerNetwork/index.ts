import { Controller } from './Controller';
import { PeerEvents, GroupEvents } from '../web.PeerNetwork.events';
import { GroupStrategy, PeerStrategy } from './strategy';

export const PeerNetwork = {
  Controller,

  GroupStrategy: GroupStrategy,
  PeerStrategy,

  PeerEvents,
  GroupEvents: GroupEvents,
};
