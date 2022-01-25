import { Controller } from './Controller';
import { PeerEvents, GroupEvents } from '../web.PeerNetwork.events';
import { GroupStrategy, PeerStrategy } from './strategy';

export const PeerNetwork = {
  Controller,

  GroupStrategy,
  PeerStrategy,

  PeerEvents,
  GroupEvents,
};
