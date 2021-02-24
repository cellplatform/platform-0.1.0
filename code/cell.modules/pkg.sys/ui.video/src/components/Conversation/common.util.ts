import { PeerJS, cuid } from '../../common';
import * as t from './types';

/**
 * Common way of creating a Peer that ensure it the creation event
 * is fired through an event bus.
 */
export function createPeer(args: { bus: t.EventBus<any>; id?: string }) {
  const id = args.id || cuid();
  const bus = args.bus.type<t.PeerEvent>();
  const peer = new PeerJS(id);
  bus.fire({ type: 'Peer/created', payload: { peer } });
  return peer;
}
