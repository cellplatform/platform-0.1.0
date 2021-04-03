import { PeerJS, t } from '../common';

type ConnectionKind = t.PeerNetworkConnectRes['kind'];

export type SelfRef = {
  id: string;
  peer: PeerJS;
  createdAt: number;
  signal: t.PeerSignallingEndpoint;
  connections: ConnectionRef[];
  media: { video?: MediaStream; screen?: MediaStream };
};

export type ConnectionRef = {
  kind: 'data' | 'media';
  id: t.PeerConnectionStatus['id'];
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
          const existing = self.connections.find((item) => item.conn.peer === conn.peer);
          if (existing) return existing;

          const local = self.peer.id;
          const remote = conn.peer;
          const ref: ConnectionRef = {
            kind,
            id: { self: local, remote },
            conn,
            remoteStream,
          };
          self.connections = [...self.connections, ref];
          return ref;
        },

        remove(conn: PeerJS.DataConnection | PeerJS.MediaConnection) {
          self.connections = self.connections.filter((item) => item.conn !== conn);
        },

        get(conn: PeerJS.DataConnection | PeerJS.MediaConnection) {
          const remote = conn.peer;
          const ref = self.connections.find((ref) => ref.id.remote === remote);
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
          return self.connections.map((ref) => ref.id.remote);
        },
      };
    },

    dispose() {
      Object.keys(refs.self).forEach((key) => delete refs.self[key]);
    },
  };

  return refs;
}
