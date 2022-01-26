import React from 'react';
import { DevActions, toObject } from 'sys.ui.dev';

import { cuid, PeerNetwork, t, WebRuntime, rx } from './DEV.common';
import { DevSample, DevSampleProps } from './DEV.Sample';

type Ctx = {
  networks: t.DevNetwork[];
};

const DEFAULT = {
  signal: 'rtc.cellfs.com',
};

type Domain = string;

const start = async (args: {
  bus: t.EventBus;
  signal: Domain;
  self?: t.PeerId;
}): Promise<t.DevNetwork> => {
  const { bus, signal } = args;
  const self = args.self ?? cuid();

  const peer = PeerNetwork.Controller({ bus });
  const netbus = PeerNetwork.Netbus({ bus, self });
  const runtime = WebRuntime.Bus.Controller({ bus, netbus });

  const events = {
    peer: PeerNetwork.PeerEvents(bus),
    group: PeerNetwork.GroupEvents(netbus),
    runtime: runtime.events,
  };

  const dispose = () => {
    peer.dispose();
    runtime.dispose();
    events.peer.dispose();
    events.group.dispose();
    events.runtime.dispose();
  };

  await events.peer.create(signal, self);
  return { self, bus, netbus, events, dispose };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('usePeerNetwork')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { networks: [] };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.button('add network', async (e) => {
      const bus = rx.bus();
      const signal = DEFAULT.signal;
      const network = await start({ bus, signal });
      e.ctx.networks.push(network);
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        label: {
          // topLeft: 'usePeerNetwork (hook)',
          topLeft: `Networks`,
          // bottomLeft: `bus/instance: "${rx.bus.instance(e.ctx.bus)}"`,
        },
      },
    });

    e.render(<DevSample networks={e.ctx.networks} />);
  });

export default actions;
