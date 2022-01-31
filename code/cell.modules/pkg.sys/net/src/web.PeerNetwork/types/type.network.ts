import { t } from './common';

/**
 * Represents a running [PeerNetwork] instance.
 */
export type PeerNetwork = {
  dispose(): void;
  bus: t.EventBus;
  netbus: t.PeerNetbus;
  events: {
    peer: t.PeerEvents;
    group: t.GroupEvents;
    runtime: t.WebRuntimeEvents;
  };
};
