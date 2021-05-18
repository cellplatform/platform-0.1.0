import { t } from './common';

export type PeerNetworkUri = PeerNetworkConnectionUri;

export type PeerNetworkConnectionUri = {
  ok: boolean;
  type: 'connection';
  kind: t.PeerConnectionKind;
  peer: t.PeerId;
  connection: t.PeerConnectionId;
  errors: string[];
};
