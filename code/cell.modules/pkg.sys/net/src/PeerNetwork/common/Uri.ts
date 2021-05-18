import * as t from './types';
import { StringUtil } from './util';

/**
 * Network URIs.
 */
export const Uri = {
  /**
   * A URI that represents a unique peer.
   */
  peer: {
    create(id: t.PeerId) {
      return `peer:${id.trim()}`;
    },

    parse(input: any, options: { throw?: boolean } = {}): t.PeerNetworkPeerUri | undefined {
      const value = toString(input);
      if (!value.startsWith('peer:')) return;

      const parts = value.split(':').map((part) => part.trim());
      const peer = parts[1] || '';
      const uri: t.PeerNetworkPeerUri = { ok: true, type: 'peer', peer, errors: [] };

      const error = (message: string) => uri.errors.push(message);
      if (!uri.peer) error(`No peer identifier`);

      uri.ok = uri.errors.length === 0;
      if (!uri.ok && options.throw) {
        throw new Error(`Peer URI could not be parsed:\n${uri.errors.join('\n')}`);
      }

      return uri;
    },
  },

  /**
   * A URI that represents a peer connection.
   */
  connection: {
    create(kind: t.PeerConnectionKind, peer: t.PeerId, id: string) {
      const type = kind.trim().replace(/\//g, '.');
      return `conn:${type}:${peer.trim()}.${StringUtil.formatConnectionId(id)}`;
    },

    parse(input: any, options: { throw?: boolean } = {}): t.PeerNetworkConnectionUri | undefined {
      const value = toString(input);
      if (!value.startsWith('conn:')) return;

      const parts = value.split(':').map((part) => part.trim());
      const kind = (parts[1] || '').replace(/\./g, '/') as t.PeerConnectionKind;
      const id = (parts[2] || '').split('.');
      const peer = (id[0] || '') as t.PeerId;
      const connection = (id[1] || '') as t.PeerConnectionId;

      const uri: t.PeerNetworkConnectionUri = {
        ok: true,
        type: 'connection',
        kind,
        peer,
        connection,
        errors: [],
      };

      const error = (message: string) => uri.errors.push(message);
      const kinds: t.PeerConnectionKind[] = ['data', 'media/screen', 'media/video'];
      if (!kinds.includes(uri.kind)) error(`Connection kind not supported`);
      if (!uri.peer) error(`No peer identifier`);
      if (!uri.connection) error(`No connection identifier`);

      uri.ok = uri.errors.length === 0;
      if (!uri.ok && options.throw) {
        throw new Error(`Connection URI could not be parsed:\n${uri.errors.join('\n')}`);
      }

      return uri;
    },
  },

  is: {
    peer: (input: any) => toString(input).startsWith('peer:'),
    connection: (input: any) => toString(input).startsWith('conn:'),
  },
};

/**
 * [Helpers]
 */
function toString(input: any) {
  return (typeof input === 'string' ? input : '').trim();
}
