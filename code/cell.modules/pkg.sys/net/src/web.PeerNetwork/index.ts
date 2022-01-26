import { Controller } from './Controller';
import { PeerEvents, GroupEvents } from '../web.PeerNetwork.events';
import { GroupStrategy, PeerStrategy } from './strategy';
import { PeerNetbus as Netbus } from '../web.PeerNetbus';

export const PeerNetwork = {
  Controller,
  Netbus,

  GroupStrategy,
  PeerStrategy,

  PeerEvents,
  GroupEvents,
};
