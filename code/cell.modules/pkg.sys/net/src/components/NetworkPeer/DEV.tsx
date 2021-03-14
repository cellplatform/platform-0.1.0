import { firstValueFrom } from 'rxjs';

import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { css, rx, t, PeerJS, cuid } from '../../common';
import { PeerController, PeerEvents } from '.';
import { Icons } from '../Icons';

type O = Record<string, unknown>;

type Ctx = {
  id: string;
  bus: t.EventBus<t.PeerEvent>;
  signal: string; // Network address.
  events: ReturnType<typeof PeerEvents>;
  data: O;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.net/NetworkPeer')

  .context((prev) => {
    if (prev) return prev;

    const id = cuid();
    const bus = rx.bus<t.PeerEvent>();
    PeerController({ bus });
    const events = PeerEvents({ bus });

    return { id, bus, events, signal: 'rtc.cellfs.com/peer', data: {} };
  })

  .items((e) => {
    e.title('settings');

    e.textbox((config) => {
      config
        .initial(config.ctx.signal)
        .title('signal end-point (`host/path`)')
        .placeholder('host/path')
        .pipe((e) => {
          if (e.changing) e.ctx.signal = e.changing.next;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Events');

    e.button('fire: Peer/create (singleton)', async (e) => {
      const { id, signal, events } = e.ctx;
      e.ctx.data = await events.connect(signal, { id });
    });

    e.hr();
  })

  .subject((e) => {
    const styles = {
      base: css({ padding: 30 }),
      icon: css({ position: 'relative', top: -5 }),
    };

    const elIcon = <Icons.Antenna size={20} style={styles.icon} />;

    e.settings({
      layout: {
        label: { topLeft: 'NetworkPeer', topRight: elIcon },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
      host: { background: -0.04 },
    });

    const el = (
      <div {...styles.base}>
        <ObjectView data={e.ctx.data} expandLevel={5} />
      </div>
    );
    e.render(el);
  });

export default actions;
