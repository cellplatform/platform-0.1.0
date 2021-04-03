import { Subject } from 'rxjs';
import { PeerJS, t } from '../common';

type C = t.PeerConnectionStatus;

/**
 * Determine if the given value is a [t.Event].
 */
export const isEvent = (input: any) => {
  if (typeof input !== 'object') return false;
  return typeof input.type === 'string' && typeof input.payload === 'object';
};

/**
 * Common filtering methods.
 */
export const Filter = {
  connectionsAs<T extends C>(connections: C[], kind: C['kind']) {
    return connections.filter((item) => item.kind === kind).map((item) => item as T);
  },
};

/**
 * Monitors errors on a PeerJS instance.
 */
export const PeerJSError = (peer: PeerJS) => {
  const $ = new Subject<{ type: string; message: string }>();

  const handler = (error: any) => {
    const { type, message } = error;
    $.next({ type, message });
  };

  peer.on('error', handler);

  return {
    $: $.asObservable(),
    dispose() {
      peer.off('error', handler);
      $.complete();
    },
  };
};

/**
 * String helpers.
 */
export const Strings = {
  parseEndpointAddress(address: string): t.PeerSignallingEndpoint {
    address = Strings.stripHttp((address || '').trim());

    const parts = address.trim().split('/');
    const path = Strings.stripPathLeft(parts[1]) || undefined;

    const hostParts = (parts[0] || '').split(':');

    const host = hostParts[0];
    const secure = !host.startsWith('localhost');
    const port = hostParts[1] ? parseInt(hostParts[1], 10) : secure ? 443 : 80;

    return { host, port, path, secure };
  },

  stripHttp(text?: string) {
    return (text || '')
      .trim()
      .replace(/^http\:\/\//, '')
      .replace(/^https\:\/\//, '');
  },

  stripPathLeft(text?: string) {
    return (text || '').trim().replace(/^\/*/, '').trim();
  },
};
