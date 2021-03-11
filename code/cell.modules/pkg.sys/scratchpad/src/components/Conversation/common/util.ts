import { PeerJS, cuid } from '../../../common';
import * as t from '../types';

/**
 * Common way of creating a Peer that ensure it the creation event
 * is fired through an event bus.
 */
export function createPeer(args: { bus: t.EventBus<any>; id?: string }) {
  const isLocalhost = location.hostname === 'localhost';
  const secure = !isLocalhost;

  console.group('🌳 ');
  console.log('create peer');
  console.log('isLocalhost', isLocalhost);
  console.log('secure', secure);
  console.groupEnd();

  const id = args.id === undefined ? cuid() : args.id;
  const bus = args.bus.type<t.ConversationEvent>();
  const peer = new PeerJS(id, {
    host: 'sys.ngrok.io',
    path: '/rtc',
    port: secure ? 443 : 80,
    secure,
  });
  bus.fire({ type: 'Conversation/created', payload: { peer } });
  return peer;
}
