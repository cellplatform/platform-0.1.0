import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t, PeerJS, cuid, time } from '../../common';

type Ref = { peer: PeerJS; connected: t.PeerCreated };
type Refs = { [id: string]: Ref };

/**
 * EventBus contoller for a WebRTC [Peer] connection.
 */
export function PeerController(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const bus = args.bus.type<t.PeerEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  const refs: Refs = {};

  /**
   * CONNECT
   */
  rx.payload<t.PeerCreateEvent>($, 'Peer/create')
    .pipe()
    .subscribe((e) => {
      const createdAt = time.now.timestamp;

      const id = (e.id || '').trim() || cuid();
      console.log('id', id);

      if (!refs[id]) {
        const endpoint = parseEndpointAddress(e.signal);
        const { host, path, port, secure } = endpoint;
        const peer = new PeerJS(id, { host, path, port, secure });
        const connected: t.PeerCreated = { id, createdAt, signal: endpoint };
        refs[id] = { peer, connected };
      }

      const ref = refs[id];
      bus.fire({
        type: 'Peer/created',
        payload: ref.connected,
      });
    });

  return {
    dispose$,
    dispose() {
      dispose$.next();
      Object.keys(refs).forEach((key) => refs[key]);
    },
  };
}

/**
 * Helpers
 */

const parseEndpointAddress = (address: string): t.PeerSignalEndpoint => {
  address = stripHttp((address || '').trim());

  const parts = address.trim().split('/');
  const path = stripPathLeft(parts[1]) || undefined;

  const hostParts = (parts[0] || '').split(':');

  const host = hostParts[0];
  const secure = !host.startsWith('localhost');
  const port = hostParts[1] ? parseInt(hostParts[1], 10) : secure ? 443 : 80;

  return { host, port, path, secure };
};

const stripHttp = (text?: string) =>
  (text || '')
    .trim()
    .replace(/^http\:\/\//, '')
    .replace(/^https\:\/\//, '');

const stripPathLeft = (text?: string) => (text || '').trim().replace(/^\/*/, '').trim();
