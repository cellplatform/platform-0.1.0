import { Controller } from './Controller';
import { Events, FilesystemEvents, GroupEvents, NetBus } from './event';
import { FilesystemStrategy, GroupStrategy, PeerStrategy } from './strategy';

export const PeerNetwork = {
  Controller,
  NetBus,

  GroupStrategy,
  PeerStrategy,
  FilesystemStrategy,

  Events,
  GroupEvents,
  FilesystemEvents,
};
