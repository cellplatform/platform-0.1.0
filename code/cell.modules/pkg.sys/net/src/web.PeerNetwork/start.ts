import { t, cuid, WebRuntime } from './common';
import { Controller } from './controller';
import { PeerNetbus } from '../web.PeerNetbus';
import { PeerEvents, GroupEvents } from '../web.PeerNetwork.events';

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

  const dispose = () => {
    peer.dispose();
    runtime.dispose();
    events.peer.dispose();
    events.group.dispose();
    events.runtime.dispose();
  };

  const api: t.PeerNetwork = {
    bus,
    netbus,
    events,
    dispose,
  };

  await events.peer.create(signal, self);
  return api;
}
