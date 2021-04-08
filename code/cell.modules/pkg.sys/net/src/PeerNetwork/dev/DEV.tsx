import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { PeerNetwork } from '..';
import { css, cuid, deleteUndefined, Icons, MediaStream, rx, t, time } from './common';
import { RootLayout } from './DEV.Root';
import { EventBridge } from './DEV.EventBridge';

type Ctx = {
  self: t.PeerId;
  bus: t.EventBus<t.PeerEvent>;
  netbus: t.EventBus;
  signal: string; // Signalling server network address (host/path).
  events: {
    net: t.PeerNetworkEvents;
    media: ReturnType<typeof MediaStream.Events>;
  };
  strategy: t.PeerStrategy;
  connectTo?: string;
  isReliable: boolean;
  debugJson: boolean;
  toStrategy(): t.PeerStrategy;
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

    EventBridge.startEventBridge({ self, bus });
    PeerNetwork.Controller({ bus });
    MediaStream.Controller({ bus });
    const strategy = PeerNetwork.Strategy({ self, bus });

    strategy.connection.autoPropagation = false; // TEMP 🐷

    const signal = 'rtc.cellfs.com/peer';
    const events = {
      net: PeerNetwork.Events({ bus }),
      media: MediaStream.Events({ bus }),
    };

    time.delay(100, async () => {
      events.media.start(EventBridge.videoRef(self)).video();
      events.net.create(signal, self);
      events.net.media(self).video();
    });

    const netbus = events.net.data(self).bus();

    /**
     * TODO 🐷
     * - Sync mic/mute settings with screen shot
     * - Timeout on screen media start.
     * - Close LOCAL screen media
     */

    return {
      self,
      bus,
      netbus,
      events,
      strategy,
      signal,
      isReliable: false,
      debugJson: false,
      connectTo: '',
      toStrategy: () => strategy,
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

    e.hr(1, 0.2);

    e.button('fire ⚡️ Peer:Local/media (video)', async (e) => {
      const data = deleteUndefined(await e.ctx.events.net.media(e.ctx.self).video());
      e.button.description = (
        <ObjectView name={'media:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire ⚡️ Peer:Local/media (screen)', async (e) => {
      const data = deleteUndefined(await e.ctx.events.net.media(e.ctx.self).screen());
      e.button.description = (
        <ObjectView name={'media:res'} data={data} fontSize={10} expandLevel={2} />
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
        .initial(config.ctx.connectTo || '')
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

    e.hr();
  })

  .items((e) => {
    e.title('Strategies (Mesh Behavior)');

    e.boolean((config) =>
      config
        .label('connection.autoPurgeOnClose')
        .description('Automatically purge connections when closed.')
        .pipe((e) => {
          const strategy = e.ctx.toStrategy();
          if (e.changing) strategy.connection.autoPurgeOnClose = e.changing.next;
          e.boolean.current = strategy.connection.autoPurgeOnClose;
        }),
    );

    e.boolean((config) =>
      config
        .label('connection.autoPropagation')
        .description('Automatically propogate data connections to peers.')
        .pipe((e) => {
          const strategy = e.ctx.toStrategy();
          if (e.changing) strategy.connection.autoPropagation = e.changing.next;
          e.boolean.current = strategy.connection.autoPropagation;
        }),
    );

    e.boolean((config) =>
      config
        .label('connection.ensureClosed')
        .description('Ensure connections are properly closed on all peers.')
        .pipe((e) => {
          const strategy = e.ctx.toStrategy();
          if (e.changing) strategy.connection.ensureClosed = e.changing.next;
          e.boolean.current = strategy.connection.ensureClosed;
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

    e.render(<RootLayout self={self} bus={bus} netbus={netbus} debugJson={e.ctx.debugJson} />);
  });

export default actions;
