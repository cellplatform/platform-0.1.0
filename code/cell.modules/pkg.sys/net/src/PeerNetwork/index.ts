import { Controller } from './Controller';
import { Events, FilesystemEvents, GroupEvents, PeerBus } from './event';
import { FilesystemStrategy, GroupStrategy, PeerStrategy } from './strategy';

export const PeerNetwork = {
  Controller,
  PeerBus,

  GroupStrategy,
  PeerStrategy,
  FilesystemStrategy,

  Events,
  GroupEvents,
  FilesystemEvents,
};
