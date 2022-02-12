import { t } from './common';

export type NetworkId = string;

/**
 * Represents a running [PeerNetwork] instance.
 */
export type PeerNetwork = {
  bus: t.EventBus;
  netbus: t.PeerNetbus;
  events: {
    peer: t.PeerEvents;
    group: t.GroupEvents;
    runtime: t.WebRuntimeEvents;
  };
  dispose(): void;
};
