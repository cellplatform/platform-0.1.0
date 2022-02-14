import { PeerNetbus } from '../web.PeerNetbus';
import { GroupEvents, PeerEvents } from '../web.PeerNetwork.events';
import { cuid, t, WebRuntime } from './common';
import { Controller } from './controller';

type DomainEndpoint = string;

type Args = {
  bus: t.EventBus<any>;
  signal: DomainEndpoint;
  self?: t.PeerId;
};

/**
 * Create and start a new peer-network.
 */
export async function start(args: Args): Promise<t.PeerNetwork> {
  const { bus, signal } = args;
  const self = args.self ?? cuid();
  const id = self;

  const peer = Controller({ bus });
  const netbus = PeerNetbus({ bus, self });
  const runtime = WebRuntime.Bus.Controller({ id, bus, netbus });

  const events = {
    peer: PeerEvents(bus),
    group: GroupEvents(netbus),
    runtime: runtime.events,
  };

  const dispose = async () => {
    peer.dispose();
    runtime.dispose();
    events.peer.dispose();
    events.group.dispose();
    events.runtime.dispose();
  };

  const status = await events.peer.status(self).object();
  const api: t.PeerNetwork = {
    dispose,
    self,
    bus,
    netbus,
    events,
    status,
  };

  await events.peer.create(signal, self);
  return api;
}
