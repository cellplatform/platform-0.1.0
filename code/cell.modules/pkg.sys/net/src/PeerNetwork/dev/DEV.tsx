import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { PeerNetwork } from '..';
import { css, cuid, deleteUndefined, Icons, MediaStreamEvents, rx, t, time } from './common';
import { Layout } from './DEV.Layout';
import { Media } from './DEV.Media';

type Ctx = {
  self: t.PeerId;
  bus: t.EventBus<t.PeerEvent>;
  netbus: t.EventBus;
  signal: string; // Signalling server network address (host/path).
  events: {
    net: ReturnType<typeof PeerNetwork.Events>;
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

    Media.startEventBridge({ self, bus });
    PeerNetwork.Controller({ bus });
    const strategy = PeerNetwork.Strategy({ self, bus });

    const signal = 'rtc.cellfs.com/peer';
    const events = {
      net: PeerNetwork.Events({ bus }),
      media: MediaStreamEvents({ bus }),
    };

    time.delay(100, () => events.net.create(signal, self));

    const netbus = events.net.data(self).bus();

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

    e.button('fire ⚡️ Peer:Local/init', async (e) => {
      const { self, signal, events } = e.ctx;
      events.net.create(signal, self);
    });

    e.button('fire ⚡️ Peer:Local/purge', async (e) => {
      const self = e.ctx.self;
      const data = deleteUndefined(await e.ctx.events.net.purge(self).fire());
      e.button.description = (
        <ObjectView name={'purged'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire ⚡️ Peer:Local/media (video)', async (e) => {
      const self = e.ctx.self;
      const data = deleteUndefined(await e.ctx.events.net.media(self).video());
      e.button.description = (
        <ObjectView name={'status:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.hr(1, 0.2);

    e.button('fire ⚡️ Peer:Local/status', async (e) => {
      const self = e.ctx.self;
      const data = deleteUndefined(await e.ctx.events.net.status(self).get());
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

    e.button('fire ⚡️ Peer:Connection/connect (data)', async (e) => {
      const { self, connectTo, events, isReliable } = e.ctx;
      if (!connectTo) {
        e.button.description = '🐷 ERROR: Remote peer not specified';
      } else {
        const res = await events.net.connection(self, connectTo).open.data({ isReliable });
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

    e.button('fire ⚡️ Peer:Connection/connect (media:video)', async (e) => {
      const { self, connectTo, events } = e.ctx;

      if (!connectTo) {
        e.button.description = '🐷 ERROR: Remote peer not specified';
      } else {
        const open = events.net.connection(self, connectTo).open;
        const res = await open.video();
        const name = res.error ? 'Fail' : 'Success';
        const el = <ObjectView name={name} data={res} fontSize={10} expandLevel={1} />;
        e.button.description = el;
      }
    });

    e.hr(1, 0.2);

    e.button('fire ⚡️ Peer:Connection/disconnect', async (e) => {
      const { self, connectTo, events } = e.ctx;
      if (!connectTo) {
        e.button.description = '🐷 ERROR: Remote peer not specified';
      } else {
        const res = await events.net.connection(self, connectTo).close();
        const name = res.error ? 'Fail' : 'Success';
        const el = <ObjectView name={name} data={res} fontSize={10} expandLevel={1} />;
        e.button.description = el;
      }
    });

    e.hr();
  })

  .items((e) => {
    e.title('Strategies (Behavior)');

    e.boolean((config) =>
      config
        .label('connection.autoPurgeOnClose [TODO]')
        .description('Automatically purge connections when closed.')
        .pipe((e) => {
          if (e.changing) e.ctx.strategy.connection.autoPurgeOnClose = e.changing.next;
          e.boolean.current = e.ctx.strategy.connection.autoPurgeOnClose;
        }),
    );

    e.boolean((config) =>
      config
        .label('connection.autoMeshPropagation [TODO]')
        .description('Automatically propogate data connections to peers.')
        .pipe((e) => {
          if (e.changing) e.ctx.strategy.connection.autoMeshPropagation = e.changing.next;
          e.boolean.current = e.ctx.strategy.connection.autoMeshPropagation;
        }),
    );
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
