import React from 'react';
import { DevActions, ObjectView, LocalStorage } from 'sys.ui.dev';

import { css, cuid, deleteUndefined, Icons, MediaStream, rx, t, time, PeerNetwork } from './common';
import { RootLayout } from './DEV.Root';
import { DevModel } from './Model';
import { EventBridge } from './Event/DEV.EventBridge';

type Ctx = {
  self: t.PeerId;
  bus: t.EventBus<t.PeerEvent | t.DevEvent>;
  netbus: t.EventBus;
  signal: string; // Signalling server network address (host/path).
  events: CtxEvents;
  strategy: t.PeerStrategy;
  connectTo?: string;
  toStrategy(): t.PeerStrategy;
  toFlags(): CtxFlags;
};
type CtxFlags = {
  isReliable: boolean;
  debugJson: boolean;
};
type CtxEvents = {
  net: t.PeerNetworkEvents;
  media: ReturnType<typeof MediaStream.Events>;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('PeerNetwork')

  .context((e) => {
    if (e.prev) return e.prev;

    const self = cuid();
    const bus = rx.bus<t.PeerEvent | t.DevEvent>();

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

    const init = () => {
      events.media.start(EventBridge.videoRef(self)).video();
      events.net.create(signal, self);
      events.net.media(self).video();
    };

    time.delay(100, init);

    const netbus = events.net.data(self).bus();

    events.net.status(self).changed$.subscribe((e) => {
      console.log('NET/CHANGED', e);
    });

    const local = LocalStorage<CtxFlags>('sys.net/dev/');
    const flags = local.object({ isReliable: true, debugJson: false });
    local.changed$.subscribe(() => e.redraw());

    return {
      self,
      bus,
      netbus,
      events,
      strategy,
      signal,
      toFlags: () => flags,
      // isReliable: true,
      // debugJson: local.get('debugJson', false),
      connectTo: '',
      toStrategy: () => strategy,
    };
  })

  .items((e) => {
    e.title('Environment');

    e.boolean('debug (json)', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.debugJson = e.changing.next;
      e.boolean.current = flags.debugJson;
    });

    e.button('network model', (e) => {
      const { self, bus, netbus } = e.toObject(e.ctx) as Ctx;
      const el = <DevModel bus={bus} netbus={netbus} self={self} />;
      e.ctx.bus.fire({ type: 'DEV/modal', payload: { el, target: 'body' } });
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

    e.button('fire ⚡️ Peer:Local/status:refresh', async (e) => {
      const self = e.ctx.self;
      e.ctx.events.net.status(self).refresh();
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
      const { self, connectTo, events } = e.ctx;
      if (!connectTo) {
        e.button.description = '🐷 ERROR: Remote peer not specified';
      } else {
        const isReliable = e.ctx.toFlags().isReliable;
        const res = await events.net.connection(self, connectTo).open.data({ isReliable });
        const name = res.error ? 'Fail' : 'Success';
        const expandLevel = res.error ? 1 : 0;
        const el = <ObjectView name={name} data={res} fontSize={10} expandLevel={expandLevel} />;
        e.button.description = el;
      }
    });

    e.boolean((config) => {
      config
        .indent(25)
        .label('reliable')
        .pipe((e) => {
          const flags = e.ctx.toFlags();
          if (e.changing) flags.isReliable = e.changing.next;
          const isReliable = flags.isReliable;
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
    const flags = e.ctx.toFlags();

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
        label: { topLeft: 'Mesh', topRight: elLabelRight },
        position: [60, 60, 80, 60],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
      host: { background: -0.04 },
      actions: { width: 380 },
    });

    e.render(<RootLayout self={self} bus={bus} netbus={netbus} debugJson={flags.debugJson} />);
  });

export default actions;
