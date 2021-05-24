import { Controller } from './Controller';
import { Events, FilesystemEvents, GroupEvents } from './event';
import { FilesystemStrategy, GroupStrategy, PeerStrategy } from './strategy';

export const PeerNetwork = {
  Controller,

  GroupStrategy,
  PeerStrategy,
  FilesystemStrategy,

  Events,
  GroupEvents,
  FilesystemEvents,
};
