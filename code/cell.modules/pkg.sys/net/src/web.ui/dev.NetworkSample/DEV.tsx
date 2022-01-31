import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { PeerNetwork, rx, t } from './DEV.common';
import { DevSample } from './DEV.Sample';

type Ctx = {
  networks: t.PeerNetwork[];
};

const DEFAULT = {
  signal: 'rtc.cellfs.com',
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('dev.Networks')
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
      const network = await PeerNetwork.start({ bus, signal });
      e.ctx.networks.push(network);
    });

    e.button('clear', (e) => {
      e.ctx.networks.forEach((net) => net.dispose());
      e.ctx.networks = [];
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
