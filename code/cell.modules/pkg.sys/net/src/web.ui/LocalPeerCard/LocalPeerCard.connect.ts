import { t } from '../common';
import { PeerEvents } from '../../web.PeerNetwork.events';

export type ConnectArgs = {
  bus: t.EventBus;
  self: t.PeerId;
  remote: t.PeerId;
  isReliable?: boolean;
  autoStartVideo?: boolean;
};
export type Connect = (args: ConnectArgs) => Promise<void>;

/**
 * Initiate a new connection.
 */

export const connect: Connect = async (args) => {
  const { self, bus, remote, isReliable, autoStartVideo } = args;
  if (!remote) return;

  const events = PeerEvents(bus);
  const conn = events.connection(self, remote);
  if (await conn.isConnected()) return;

  // Invoke the action(s).
  const res = await conn.open.data({ isReliable });
  if (autoStartVideo && res.connection) {
    const parent = res.connection.id;
    await conn.open.media('media/video', { parent });
  }

  // Finish up.
  events.dispose();
};
