import { PeerJS, cuid } from '../../../common';
import * as t from '../types';

/**
 * Common way of creating a Peer that ensure it the creation event
 * is fired through an event bus.
 */
export function createPeer(args: { bus: t.EventBus<any>; id?: string }) {
  const host = 'rtc.cellfs.com';
  const path = 'peer';
  const secure = true;
  const port = secure ? 443 : 80;

  console.group('🌳 Create Peer');
  console.log('host', host);
  console.log('path', path);
  console.log('port', port);
  console.log('secure', secure);
  console.groupEnd();

  const id = args.id === undefined ? cuid() : args.id;
  const bus = args.bus.type<t.ConversationEvent>();

  // https://peerjs-server-hcx2v.ondigitalocean.app/myapp

  const peer = new PeerJS(id, { host, path, port, secure });

  bus.fire({ type: 'Conversation/created', payload: { peer } });
  return peer;
}
