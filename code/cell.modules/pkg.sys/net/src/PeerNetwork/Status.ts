import { deleteUndefined, PeerJS, t } from './common';
import { ConnectionRef, SelfRef } from './Refs';

export const Status = {
  /**
   * Derive a [PeerStatus] from a reference.
   */
  toSelf(self: SelfRef): t.PeerStatus {
    const { peer, createdAt, signal } = self;
    const id = peer.id;
    const connections = self.connections.map((ref) => Status.toConnection(ref));
    return deleteUndefined<t.PeerStatus>({
      id,
      isOnline: navigator.onLine,
      createdAt,
      signal,
      connections,
    });
  },

  /**
   * Derive a [PeerConnectionStatus] from a reference.
   */
  toConnection(ref: ConnectionRef): t.PeerConnectionStatus {
    const { kind, peer, id, uri, direction } = ref;

    if (kind === 'data') {
      const conn = ref.conn as PeerJS.DataConnection;
      const { reliable: isReliable, open: isOpen, metadata } = conn;
      return { uri, id, peer, kind, direction, isReliable, isOpen, metadata };
    }

    if (kind === 'media/video' || kind === 'media/screen') {
      const media = ref.remoteStream as MediaStream;
      const conn = ref.conn as PeerJS.MediaConnection;
      const { open: isOpen, metadata } = conn;
      return { uri, id, peer, kind, direction, isOpen, metadata, media };
    }

    throw new Error(`Kind of connection not supported: ${uri}`);
  },
};
