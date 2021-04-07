import { PeerJS, t } from './common';
import { Uri } from './Uri';
import { StringUtil } from './util';

type ConnectionKind = t.PeerNetworkConnectRes['kind'];

export type SelfRef = {
  id: t.PeerId;
  peer: PeerJS;
  createdAt: number;
  signal: t.PeerSignallingEndpoint;
  connections: ConnectionRef[];
  media: { video?: MediaStream; screen?: MediaStream };
};

export type ConnectionRef = {
  kind: t.PeerConnectionKind;
  peer: t.PeerConnectionStatus['peer'];
  id: t.PeerConnectionId;
  uri: t.PeerConnectionUri;
  conn: PeerJS.DataConnection | PeerJS.MediaConnection;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
};

/**
 * Memory references to network objects.
 */
export function MemoryRefs() {
  const self: { [id: string]: SelfRef } = {};
  const refs = {
    self,

    connection(input: SelfRef | string) {
      const self = typeof input === 'string' ? refs.self[input] : input;
      return {
        add(
          kind: ConnectionKind,
          conn: PeerJS.DataConnection | PeerJS.MediaConnection,
          remoteStream?: MediaStream,
        ) {
          const remote = conn.peer;
          const peer = { self: self.peer.id, remote };
          const id = StringUtil.formatConnectionId((conn as any).connectionId);
          const uri = Uri.connection(kind, remote, id);

          const existing = self.connections.find((item) => item.uri === uri);
          if (existing) return existing;

          const ref: ConnectionRef = { kind, uri, id, peer, conn, remoteStream };
          self.connections = [...self.connections, ref];
          return ref;
        },

        remove(conn: PeerJS.DataConnection | PeerJS.MediaConnection) {
          self.connections = self.connections.filter((item) => item.conn !== conn);
        },

        get(conn: PeerJS.DataConnection | PeerJS.MediaConnection) {
          const remote = conn.peer;
          const ref = self.connections.find((ref) => ref.peer.remote === remote);
          if (!ref) {
            const err = `The connection reference '${remote}' for local network '${self.id}' has not been added`;
            throw new Error(err);
          }
          return ref;
        },

        get data() {
          return self.connections
            .filter((ref) => ref.kind === 'data')
            .map((ref) => ref.conn as PeerJS.DataConnection);
        },

        get media() {
          return self.connections
            .filter((ref) => ref.kind === 'media')
            .map((ref) => ref.conn as PeerJS.MediaConnection);
        },

        get ids() {
          return self.connections.map((ref) => ref.peer.remote);
        },
      };
    },

    dispose() {
      Object.keys(refs.self).forEach((key) => delete refs.self[key]);
    },
  };

  return refs;
}
