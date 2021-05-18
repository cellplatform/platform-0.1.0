import { t } from './common';

export type PeerConnectionUriString = string;

/**
 * Parsed URI Objects
 */
export type PeerUri = PeerPeerUri | PeerConnectionUri;

export type PeerPeerUri = {
  ok: boolean;
  type: 'peer';
  peer: t.PeerId;
  errors: string[];
};

export type PeerConnectionUri = {
  ok: boolean;
  type: 'connection';
  kind: t.PeerConnectionKind;
  peer: t.PeerId;
  connection: t.PeerConnectionId;
  errors: string[];
};
