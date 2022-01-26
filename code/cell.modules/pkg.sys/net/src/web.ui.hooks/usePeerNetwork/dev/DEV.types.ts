import * as t from '../../../common/types';

export * from '../../../common/types';

export type DevNetwork = {
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
