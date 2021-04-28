import { Controller } from './Controller';
import { Events, GroupEvents, NetBus } from './event';
import { GroupStrategy, PeerStrategy, FilesystemStrategy } from './strategy';

export const PeerNetwork = {
  Controller,
  NetBus,

  GroupStrategy,
  PeerStrategy,
  FilesystemStrategy,

  Events,
  GroupEvents,
};
