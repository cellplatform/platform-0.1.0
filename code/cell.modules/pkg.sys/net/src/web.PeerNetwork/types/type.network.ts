import { t } from './common';

/**
 * Represents a running [PeerNetwork] instance.
 */
export type PeerNetwork = {
  dispose(): void;
  self: t.PeerId;
  bus: t.EventBus;
  netbus: t.NetworkBus;
  events: {
    peer: t.PeerEvents;
    group: t.GroupEvents;
    runtime: t.WebRuntimeEvents;
  };
};
