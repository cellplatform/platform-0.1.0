import React from 'react';
import { DevActions, LocalStorage, ObjectView } from 'sys.ui.dev';

import {
  css,
  cuid,
  deleteUndefined,
  Icons,
  MediaStream,
  PeerNetwork,
  rx,
  t,
  time,
  isLocalhost,
} from './common';
import { RootLayout } from './DEV.Root';
import { EventBridge } from './event';
import { DevModel, DevGroupSeed, GroupSeed } from './model';

import { QueryString } from '@platform/util.string/lib/QueryString';

type Ctx = {
  self: t.PeerId;
  bus: t.EventBus<t.PeerEvent | t.DevEvent>;
  netbus: t.NetBus;
  signal: string; // Signalling server network address (host/path).
  events: CtxEvents;
  connectTo?: string;
  toStrategy(): { peer: t.PeerStrategy; group: t.GroupStrategy; fs: t.FilesystemStrategy };
  toFlags(): CtxFlags;
  toSeed(): GroupSeed;
  fullscreen(value: boolean): void;
};
type CtxFlags = {
  isFullscreen: boolean;
  isReliable: boolean;
  debugJson: boolean;
  collapseData: boolean;
  collapseMedia: boolean;
  cardsMedia: boolean;
  cardsData: boolean;
};
type CtxEvents = {
  peer: t.PeerNetworkEvents;
  group: t.GroupEvents;
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

    const signal = 'rtc.cellfs.com/peer';
    const netbus = PeerNetwork.NetBus({ bus, self });
    const events = {
      peer: PeerNetwork.Events(bus),
      group: PeerNetwork.GroupEvents(netbus),
      media: MediaStream.Events(bus),
    };

    const strategy = {
      peer: PeerNetwork.PeerStrategy({ self, bus }),
      group: PeerNetwork.GroupStrategy({ bus, netbus }),
      fs: PeerNetwork.FilesystemStrategy({ bus, netbus }),
    };

    strategy.peer.connection.autoPropagation = false; // TEMP 🐷

    const init = () => {
      events.media.start(EventBridge.videoRef(self)).video();
      events.peer.create(signal, self);
      events.peer.media(self).video();
    };
    time.delay(100, init);

    events.peer.status(self).changed$.subscribe((e) => {
      console.log('NET/CHANGED', e);
    });

    const storage = LocalStorage<CtxFlags>('sys.net/dev/PeerNetwork');

    const flags = storage.object({
      isFullscreen: true,
      isReliable: true,
      debugJson: false,
      collapseData: false,
      collapseMedia: false,
      cardsData: true,
      cardsMedia: false,
    });
    storage.changed$.subscribe(() => e.redraw());

    /**
     * Group seed model/controller
     */
    const query = QueryString.toObject<{ group: string }>(location.href);
    const host = isLocalhost ? 5000 : location.host;
    const seed = DevGroupSeed({ self, bus, host, groupname: query.group });
    if (query.group) {
      (async () => {
        // await seed.init();
        seed.connect();
      })();
    }

    return {
      self,
      bus,
      netbus,
      events,
      signal,
      connectTo: '',
      toFlags: () => flags,
      toStrategy: () => strategy,
      toSeed: () => seed,
      fullscreen: (value) => (flags.isFullscreen = value),
    };
  })

  .items((e) => {
    e.title('Environment');

    e.boolean('debug (json)', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.debugJson = e.changing.next;
      e.boolean.current = flags.debugJson;
    });

    e.button('debug (group)', async (e) => {
      const res = await e.ctx.events.group.connections().get();

      console.group('🌳 Group');
      console.log('local', res.local);
      console.log('remote', res.remote);
      console.log('pending', res.pending);

      console.groupEnd();
    });

    e.hr(1, 0.2);

    e.boolean('collapse: data', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.collapseData = e.changing.next;
      e.boolean.current = flags.collapseData;
    });

    e.boolean('collapse: media', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.collapseMedia = e.changing.next;
      e.boolean.current = flags.collapseMedia;
    });

    e.boolean('cards: data', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.cardsData = e.changing.next;
      e.boolean.current = flags.cardsData;
    });

    e.boolean('cards: media', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.cardsMedia = e.changing.next;
      e.boolean.current = flags.cardsMedia;
    });

    e.hr(1, 0.2);

    e.button('network model', (e) => {
      const { bus, netbus } = e.toObject(e.ctx) as Ctx;
      const el = <DevModel bus={bus} netbus={netbus} />;
      e.ctx.bus.fire({ type: 'DEV/modal', payload: { el, target: 'body' } });
    });

    e.button('group/layout: cards (default)', (e) => {
      const netbus = e.toObject<Ctx>(e.ctx)?.netbus as t.NetBus<t.DevEvent>;
      netbus.fire({
        type: 'DEV/group/layout',
        payload: { kind: 'cards' },
      });
    });

    e.button('group/layout: videos', (e) => {
      const netbus = e.toObject<Ctx>(e.ctx)?.netbus as t.NetBus<t.DevEvent>;
      netbus.fire({
        type: 'DEV/group/layout',
        payload: { kind: 'videos' },
      });
    });

    e.hr(1, 0.2);

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
    e.title('Group Seed');

    const writePeers = async (seed: GroupSeed) => {
      const peers = await seed.peers();
      console.log('peers', peers);
    };

    e.button('init', async (e) => {
      const seed = e.ctx.toSeed();
      await seed.init();
      await writePeers(seed);
    });

    e.button('peers', async (e) => {
      const seed = e.ctx.toSeed();
      await writePeers(seed);
    });

    e.button('clear', async (e) => {
      const seed = e.ctx.toSeed();
      await seed.clear();
      await writePeers(seed);
    });

    e.hr(1, 0.1);

    e.button('connect', async (e) => {
      const seed = e.ctx.toSeed();
      await writePeers(seed);
      await seed.connect();
    });

    e.hr();
  })

  .items((e) => {
    e.title('Events');

    e.button('fire ⚡️ Peer:Local/init', async (e) => {
      const { self, signal, events } = e.ctx;
      events.peer.create(signal, self);
    });

    e.button('fire ⚡️ Peer:Local/purge', async (e) => {
      const self = e.ctx.self;
      const data = deleteUndefined(await e.ctx.events.peer.purge(self).fire());
      e.button.description = (
        <ObjectView name={'purged'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire ⚡️ Peer:Local/status:refresh', async (e) => {
      const self = e.ctx.self;
      e.ctx.events.peer.status(self).refresh();
    });

    e.hr(1, 0.2);

    e.button('fire ⚡️ Peer:Local/media (video)', async (e) => {
      const data = deleteUndefined(await e.ctx.events.peer.media(e.ctx.self).video());
      e.button.description = (
        <ObjectView name={'media:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire ⚡️ Peer:Local/media (screen)', async (e) => {
      const data = deleteUndefined(await e.ctx.events.peer.media(e.ctx.self).screen());
      e.button.description = (
        <ObjectView name={'media:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.hr(1, 0.2);

    e.button('fire ⚡️ Peer:Local/status', async (e) => {
      const self = e.ctx.self;
      const data = deleteUndefined(await e.ctx.events.peer.status(self).get());
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
        const res = await events.peer.connection(self, connectTo).open.data({ isReliable });
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
        .title('connection')
        .label('connection.autoPurgeOnClose')
        .description('Automatically purge connections when closed.')
        .pipe((e) => {
          const strategy = e.ctx.toStrategy();
          if (e.changing) strategy.peer.connection.autoPurgeOnClose = e.changing.next;
          e.boolean.current = strategy.peer.connection.autoPurgeOnClose;
        }),
    );

    e.boolean((config) =>
      config
        .label('connection.autoPropagation')
        .description('Automatically propogate data connections to peers.')
        .pipe((e) => {
          const strategy = e.ctx.toStrategy();
          if (e.changing) strategy.peer.connection.autoPropagation = e.changing.next;
          e.boolean.current = strategy.peer.connection.autoPropagation;
        }),
    );

    e.boolean((config) =>
      config
        .label('connection.ensureClosed')
        .description('Ensure connections are properly closed on all peers.')
        .pipe((e) => {
          const strategy = e.ctx.toStrategy();
          if (e.changing) strategy.peer.connection.ensureClosed = e.changing.next;
          e.boolean.current = strategy.peer.connection.ensureClosed;
        }),
    );

    e.hr(1, 0.1);

    e.boolean((config) =>
      config
        .title('group')
        .label('group.connections')
        .description('Retrieve details about the network of peers/connections.')
        .pipe((e) => {
          const strategy = e.ctx.toStrategy();
          if (e.changing) strategy.group.connections = e.changing.next;
          e.boolean.current = strategy.group.connections;
        }),
    );

    e.hr(1, 0.1);

    e.boolean((config) =>
      config
        .title('filesystem')
        .label('filesystem.cache')
        .description('De-dupe and manage caching network files.')
        .pipe((e) => {
          const strategy = e.ctx.toStrategy();
          if (e.changing) strategy.fs.cache = e.changing.next;
          e.boolean.current = strategy.fs.cache;
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
        position: [60, 60, 70, 60],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
      host: { background: -0.04 },
      actions: { width: 380 },
    });

    e.render(
      <RootLayout
        bus={bus}
        netbus={netbus}
        debugJson={flags.debugJson}
        collapse={{ data: flags.collapseData, media: flags.collapseMedia }}
        cards={{ data: flags.cardsData, media: flags.cardsMedia }}
      />,
    );
  });

export default actions;
