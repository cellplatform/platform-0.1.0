import { t } from '../common';
import { PeerEvents } from '../../web.PeerNetwork.events';

/**
 * Initiate a new connection.
 */
export async function connect(args: {
  bus: t.EventBus;
  self: t.PeerId;
  remote: t.PeerId;

  isReliable?: boolean;
  autoStartVideo?: boolean;
}) {
  const { self, bus, remote, isReliable, autoStartVideo } = args;
  if (!remote) return;

  const events = PeerEvents(bus);
  const status = (await events.status(self).get()).peer;
  if (!status) throw new Error(`Status could not be retrieved.`);

  const isConnected = status.connections
    .filter(({ kind }) => kind === 'data')
    .some(({ peer }) => peer.remote.id === remote);
  if (isConnected) return; // Already connected.

  // Invoke the action(s).
  const open = events.connection(self, remote).open;
  const res = await open.data({ isReliable });

  if (autoStartVideo && res.connection) {
    const parent = res.connection.id;
    await open.media('media/video', { parent });
  }

  // Finish up.
  events.dispose();
}
