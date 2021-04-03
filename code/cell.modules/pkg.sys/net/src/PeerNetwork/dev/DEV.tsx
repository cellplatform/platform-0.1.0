import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { PeerNetwork } from '..';
import { css, cuid, deleteUndefined, Icons, MediaStreamEvents, rx, t, time } from './common';
import { Layout } from './DEV.Layout';

type Ctx = {
  self: t.PeerId;
  bus: t.EventBus<t.PeerEvent>;
  netbus: t.EventBus;
  signal: string; // Signalling server network address (host/path).
  events: {
    network: ReturnType<typeof PeerNetwork.Events>;
    media: ReturnType<typeof MediaStreamEvents>;
  };
  strategy: t.PeerStrategy;
  connectTo?: string;
  isReliable: boolean;
  debugJson: boolean;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.net/PeerNetwork')

  .context((prev) => {
    if (prev) return prev;

    const self = cuid();
    const bus = rx.bus<t.PeerEvent>();

    PeerNetwork.Controller({ bus });
    const strategy = PeerNetwork.Strategy({ self, bus });

    const signal = 'rtc.cellfs.com/peer';
    const events = {
      network: PeerNetwork.Events({ bus }),
      media: MediaStreamEvents({ bus }),
    };

    time.delay(100, () => events.network.create(signal, self));

    const netbus = events.network.data(self).bus();

    netbus.event$.subscribe((e) => {
      console.log('Network Bus', e.type, e.payload);
    });

    return {
      self,
      bus,
      netbus,
      events,
      strategy,
      signal,
      isReliable: false,
      debugJson: false,
    };
  })

  .items((e) => {
    e.title('Environment');

    e.boolean('debug (json)', (e) => {
      if (e.changing) e.ctx.debugJson = e.changing.next;
      e.boolean.current = e.ctx.debugJson;
    });

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

    e.button('fire - Peer:Network/init', async (e) => {
      const { self, signal, events } = e.ctx;
      events.network.create(signal, self);
    });

    e.button('fire - Peer:Network/purge', async (e) => {
      const ref = e.ctx.self;
      const data = deleteUndefined(await e.ctx.events.network.purge(ref).fire());
      e.button.description = (
        <ObjectView name={'purged'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire - Peer:Network/status', async (e) => {
      const ref = e.ctx.self;
      const data = deleteUndefined(await e.ctx.events.network.status(ref).get());
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

    e.button('fire - Peer:Connection/connect (data)', async (e) => {
      const { self, connectTo, events, isReliable } = e.ctx;
      if (!connectTo) {
        e.button.description = '🐷 ERROR: Remote peer not specified';
      } else {
        const metadata = { foo: 123 };
        const res = await events.network
          .connection(self, connectTo)
          .open.data({ isReliable, metadata });
        const name = res.error ? 'Fail' : 'Success';
        const el = <ObjectView name={name} data={res} fontSize={10} expandLevel={1} />;
        e.button.description = el;
      }
    });

    e.boolean((config) => {
      config
        .indent(25)
        .label('reliable')
        .pipe((e) => {
          if (e.changing) e.ctx.isReliable = e.changing.next;
          const isReliable = e.ctx.isReliable;
          e.boolean.current = isReliable;
          e.boolean.description = isReliable
            ? '(eg. large file transfers)'
            : '(eg. streaming or gaming)';
        });
    });

    // e.button('fire - PeerNetwork/connect (media:video)', async (e) => {
    //   const { id, connectTo, events } = e.ctx;

    //   if (!connectTo) {
    //     e.button.description = '🐷 ERROR: Remote peer not specified';
    //   } else {
    //     const { stream } = await events.media.status(id).get();
    //     const outgoing = stream?.media;

    //     if (!outgoing) {
    //       e.button.description = `🐷 ERROR: No outgoing MediaStream`;
    //       return;
    //     }

    //     const metadata = { foo: 123 };
    //     const open = events.network.connection(id, connectTo).open;
    //     const res = await open.media({ metadata });
    //     const name = res.error ? 'Fail' : 'Success';
    //     const el = <ObjectView name={name} data={res} fontSize={10} expandLevel={1} />;
    //     e.button.description = el;
    //   }
    // });

    // e.hr(1, 0.1);

    e.button('fire - Peer:Connection/disconnect', async (e) => {
      const { self, connectTo, events } = e.ctx;
      if (!connectTo) {
        e.button.description = '🐷 ERROR: Remote peer not specified';
      } else {
        const res = await events.network.connection(self, connectTo).close();
        const name = res.error ? 'Fail' : 'Success';
        const el = <ObjectView name={name} data={res} fontSize={10} expandLevel={1} />;
        e.button.description = el;
      }
    });

    e.hr();
  })

  .items((e) => {
    e.title('Strategies (Behavior)');

    e.boolean('auto purge connection on close [TODO]', (e) => {
      if (e.changing) e.ctx.strategy.connection.purgeOnClose = e.changing.next;
      e.boolean.current = e.ctx.strategy.connection.purgeOnClose;
    });

    e.boolean('auto connection propogation (mesh) [TODO]', (e) => {
      if (e.changing) e.ctx.strategy.connection.purgeOnClose = e.changing.next;
      e.boolean.current = e.ctx.strategy.connection.purgeOnClose;
    });
  })

  .subject((e) => {
    const { self, bus, netbus } = e.ctx;

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
        peer:{self}
        <Icons.Antenna size={20} style={styles.labelRight.icon} />
      </div>
    );

    e.settings({
      layout: {
        label: { topLeft: 'PeerNetwork', topRight: elLabelRight },
        position: [60, 60, 80, 60],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
      host: { background: -0.04 },
      actions: { width: 380 },
    });

    e.render(<Layout self={self} bus={bus} netbus={netbus} debugJson={e.ctx.debugJson} />);
  });

export default actions;
