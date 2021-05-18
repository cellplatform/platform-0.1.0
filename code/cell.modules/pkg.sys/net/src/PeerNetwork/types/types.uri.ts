import { t } from './common';

export type PeerNetworkUri = PeerNetworkPeerUri | PeerNetworkConnectionUri;

export type PeerNetworkPeerUri = {
  ok: boolean;
  type: 'peer';
  peer: t.PeerId;
  errors: string[];
};

export type PeerNetworkConnectionUri = {
  ok: boolean;
  type: 'connection';
  kind: t.PeerConnectionKind;
  peer: t.PeerId;
  connection: t.PeerConnectionId;
  errors: string[];
};
