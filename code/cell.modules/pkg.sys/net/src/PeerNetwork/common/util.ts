import { Subject } from 'rxjs';

import { defaultValue, PeerJS, Hash, filesize } from '../../common';
import * as t from './types';

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
export const FilterUtil = {
  connectionsAs<T extends C>(connections: C[], kind: C['kind'] | C['kind'][]) {
    const kinds = Array.isArray(kind) ? kind : [kind];
    return connections.filter((item) => kinds.includes(item.kind)).map((item) => item as T);
  },
};

/**
 * Monitors errors on a PeerJS instance.
 */
export const PeerJsUtil = {
  error(peer: PeerJS) {
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
  },
};

/**
 * String helpers.
 */
export const StringUtil = {
  formatConnectionId(id: string) {
    return (id || '').trim().replace(/^dc_/, '').replace(/^mc_/, '');
  },

  parseEndpointAddress(address: string): t.PeerSignallingEndpoint {
    address = StringUtil.stripHttp((address || '').trim());

    const key = 'conn';
    const parts = address.trim().split('/');
    const path = StringUtil.stripPathLeft(parts[1]) || '/';
    const hostParts = (parts[0] || '').split(':');

    const host = hostParts[0];
    const secure = !host.startsWith('localhost');
    const port = hostParts[1] ? parseInt(hostParts[1], 10) : secure ? 443 : 80;

    const base = `http${secure ? 's' : ''}://${host}:${port}${path}`;
    const url = {
      base,
      peers: `${base.replace(/\/$/, '')}/conn/peers`,
    };

    return { key, host, port, path, secure, url };
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

  truncate(value: string, options: { edge?: number; divider?: string } = {}) {
    const { divider = '...' } = options;
    const edge = defaultValue(options.edge, 8);
    const left = value.substring(0, edge);
    const right = value.substring(value.length - edge);
    return `${left}${divider}${right}`;
  },
};

/**
 * MediaStream helpers.
 */
export const StreamUtil = {
  /**
   * Fires a callback when all tracks witin a stream have "ended".
   */
  onEnded(stream: MediaStream, callback: () => void) {
    const tracks = stream.getTracks().map((track) => track.clone());
    const isEnded = () => tracks.every((track) => track.readyState === 'ended');
    const onTrackEnded = () => {
      if (isEnded()) callback();
    };
    tracks.forEach((track) => (track.onended = onTrackEnded));
  },
};

/**
 * Helpers for working with network files.
 */
export const FileUtil = {
  /**
   * Convert dropped files to a [PeerFile] data type.
   */
  toFiles(
    dir: string,
    files: { path: string; data: ArrayBuffer; mimetype: string }[],
  ): t.PeerFile[] {
    return files.map(({ data, path, mimetype }) => {
      const hash = Hash.sha256(data);
      const blob = new Blob([data], { type: mimetype });
      return { dir, blob, filename: path, hash };
    });
  },

  /**
   * Load a file as a base64 encoded data URI.
   */
  toUri(input: Blob | ArrayBuffer) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') {
          return reject(new Error(`FileReader did not return a string`));
        } else {
          resolve(reader.result);
        }
      };
      reader.onerror = () => reject(reader.error);

      const blob = input instanceof Blob ? input : new Blob([input]);
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Turn the number of bytes into a human readable filesize.
   */
  filesize(blob: Blob) {
    const bytes = blob.size;
    return { bytes, toString: () => filesize(blob.size, { round: 1 }) };
  },
};
