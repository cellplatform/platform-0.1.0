import * as t from './types';
import { StringUtil } from './util';

/**
 * Network URIs.
 */
export const Uri = {
  connection: {
    create(kind: t.PeerConnectionKind, peer: t.PeerId, id: string) {
      return `conn:${kind.replace(/\//g, '.')}:${peer}.${StringUtil.formatConnectionId(id)}`;
    },

    parse(input: any, options: { throw?: boolean } = {}): t.PeerNetworkConnectionUri | undefined {
      const value = (typeof input === 'string' ? input : '').trim();
      if (!value.startsWith('conn:')) return;

      const parts = value
        .replace(/^conn\:/, '')
        .split(':')
        .map((part) => part.trim());

      const kind = (parts[0] || '').replace(/\./g, '/') as t.PeerConnectionKind;
      const id = (parts[1] || '').split('.');
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
    connection(input: any) {
      const value = (typeof input === 'string' ? input : '').trim();
      return value.startsWith('conn:');
    },
  },
};
