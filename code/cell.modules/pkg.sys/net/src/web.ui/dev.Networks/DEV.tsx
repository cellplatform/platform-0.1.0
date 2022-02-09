import React from 'react';
import { DevActions, ObjectView, toObject } from 'sys.ui.dev';

import { css, PeerNetwork, rx, t } from './DEV.common';
import { DevSample } from './DEV.Sample';

type Ctx = {
  networks: t.PeerNetwork[];
  debug: { background: boolean };
};

const SIGNAL_SERVER = 'rtc.cellfs.com';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('dev.Networks')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      networks: [],
      debug: { background: false },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    if (ctx.networks.length === 0) {
      await addNetwork(ctx);
      await addNetwork(ctx);
    }
  })

  .items((e) => {
    e.title('Network Client');

    e.button('add', (e) => addNetwork(e.ctx));

    e.hr(1, 0.1);
    e.button('clear', (e) => {
      const ctx = e.ctx;
      ctx.networks.forEach((net) => net.dispose());
      ctx.networks = [];
    });

    e.button('remove (last)', (e) => {
      const ctx = e.ctx;
      const index = ctx.networks.length - 1;
      const last = ctx.networks[index];
      if (last) {
        ctx.networks = ctx.networks.slice(0, index);
        last.dispose();
      }
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('background', (e) => {
      if (e.changing) e.ctx.debug.background = e.changing.next;
      e.boolean.current = e.ctx.debug.background;
    });

    e.hr();
    e.component((e) => {
      const { networks } = e.ctx;
      const data = { networks };
      return <ObjectView name={'state'} data={data} style={{ MarginX: 15 }} />;
    });
  })

  .subject((e) => {
    const { networks, debug } = e.ctx;
    const isEmpty = networks.length === 0;

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        position: [60, 40, 80, 40],
        background: debug.background ? 1 : 0,
        label: {
          topLeft: !isEmpty && 'Peer-to-Peer',
          topRight: !isEmpty && `WebRTC Signal: "${SIGNAL_SERVER}"`,
        },
      },
    });

    /**
     * [Render]
     */
    const styles = {
      base: css({
        flex: 1,
        Scroll: true,
        Padding: debug.background ? [70, 45] : undefined,
      }),
    };

    e.render(
      <div {...styles.base}>
        <DevSample networks={networks} />
      </div>,
    );
  });

export default actions;

/**
 * Helpers
 */

async function addNetwork(ctx: Ctx) {
  const bus = rx.bus();
  const signal = SIGNAL_SERVER;
  const network = await PeerNetwork.start({ bus, signal });
  ctx.networks.push(network);
}
