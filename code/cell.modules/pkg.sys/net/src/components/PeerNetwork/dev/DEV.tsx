import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { PeerNetworkController, PeerNetworkEvents } from '..';
import { Button, copyToClipboard, css, cuid, deleteUndefined, Icons, rx, t, time } from './common';
import { Info } from './DEV.Info';

type Ctx = {
  id: string;
  bus: t.EventBus<t.PeerNetworkEvent>;
  signal: string; // Signalling server network address (host/path).
  events: ReturnType<typeof PeerNetworkEvents>;
  connectTo?: string;
  reliable: boolean;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.net/PeerNetwork')

  .context((prev) => {
    if (prev) return prev;

    const id = cuid();
    const bus = rx.bus<t.PeerNetworkEvent>();

    PeerNetworkController({ bus });
    const signal = 'rtc.cellfs.com/peer';
    const events = PeerNetworkEvents({ bus });

    time.delay(0, () => events.create(signal, { id }));
    events.connections(id).closed$.subscribe(() => events.purge(id).fire());

    return {
      id,
      bus,
      events,
      signal,
      reliable: false,
    };
  })

  .items((e) => {
    e.title('Environment');

    e.textbox((config) => {
      config
        .initial(config.ctx.signal)
        .title('Signal end-point:')
        .placeholder('host/path')
        .description('Format: `host/path`')
        .pipe((e) => {
          if (e.changing) e.ctx.signal = e.changing.next;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Events');

    e.button('fire: PeerNetwork/create', async (e) => {
      const { id, signal, events } = e.ctx;
      events.create(signal, { id });
    });

    e.button('fire: PeerNetwork/purge', async (e) => {
      const ref = e.ctx.id;
      const data = deleteUndefined(await e.ctx.events.purge(ref).fire());
      e.button.description = (
        <ObjectView name={'purged'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire: PeerNetwork/status:req', async (e) => {
      const ref = e.ctx.id;
      const data = deleteUndefined(await e.ctx.events.status(ref).get());
      e.button.description = (
        <ObjectView name={'status:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.hr();

    e.title('Connection');
    e.textbox((config) => {
      config
        .title('Target network peer:')
        .placeholder('remote <cuid>')
        .pipe((e) => {
          if (e.changing) e.ctx.connectTo = e.changing.next;
        });
    });

    e.hr(0, 0, 20);

    e.button('fire: PeerNetwork/connect (data)', async (e) => {
      const { id, connectTo, events, reliable } = e.ctx;
      if (!connectTo) {
        e.button.description = '🐷 ERROR: Remote network not specified';
      } else {
        const res = await events.connection(id, connectTo).open.data({ reliable });
        const name = res.error ? 'fail' : 'Success';
        const el = <ObjectView name={name} data={res} fontSize={10} expandLevel={1} />;
        e.button.description = el;
      }
    });

    e.boolean((config) => {
      config
        .indent(25)
        .label('reliable')
        .pipe((e) => {
          if (e.changing) e.ctx.reliable = e.changing.next;
          e.boolean.current = e.ctx.reliable;
        });
    });

    e.button('fire: PeerNetwork/connect (video)');

    e.hr(1, 0.1);

    e.button('fire: PeerNetwork/disconnect', async (e) => {
      const { id, connectTo, events } = e.ctx;

      if (!connectTo) {
        e.button.description = '🐷 ERROR: Remote network not specified';
      } else {
        const res = await events.connection(id, connectTo).close();
        const name = res.error ? 'fail' : 'Success';
        const el = <ObjectView name={name} data={res} fontSize={10} expandLevel={1} />;
        e.button.description = el;
      }
    });

    e.hr();
  })

  .subject((e) => {
    const { id, bus } = e.ctx;

    const styles = {
      labelRight: {
        base: css({
          position: 'relative',
          Flex: 'horizontal-center-center',
          top: -5,
          fontSize: 11,
        }),
        icon: { marginLeft: 8 },
      },
    };

    const elLabelRight = (
      <div {...styles.labelRight.base}>
        peer:{id}
        <Icons.Antenna size={20} style={styles.labelRight.icon} />
      </div>
    );

    e.settings({
      layout: {
        label: { topLeft: 'PeerNetwork', topRight: elLabelRight },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
      host: { background: -0.04 },
      actions: { width: 380 },
    });

    e.render(<Info id={id} bus={bus} />);
  });

export default actions;
