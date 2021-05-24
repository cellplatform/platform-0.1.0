import { Controller } from './Controller';
import { PeerEvents, FilesystemEvents, GroupEvents } from './event';
import { FilesystemStrategy, GroupStrategy, PeerStrategy } from './strategy';

export const PeerNetwork = {
  Controller,

  GroupStrategy,
  PeerStrategy,
  FilesystemStrategy,

  PeerEvents,
  GroupEvents,
  FilesystemEvents,
};
