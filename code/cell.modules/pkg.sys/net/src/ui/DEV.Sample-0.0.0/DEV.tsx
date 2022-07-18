import React from 'react';

import { PeerNetwork } from '../../';
import { DevActions, LocalStorage, ObjectView, TEST, toObject } from '../../test';
import {
  css,
  cuid,
  deleteUndefined,
  Filesystem,
  Icons,
  MediaStream,
  PeerNetbus,
  rx,
  t,
  TARGET_NAME,
  time,
  WebRuntime,
} from './DEV.common';
import { EventBridge } from './DEV.event';
import { DevProps } from './DEV.Props';
import { DevRootLayout } from './DEV.Root';

type O = Record<string, unknown>;

type Ctx = {
  self: t.PeerId;
  bus: t.EventBus<t.PeerEvent | t.DevEvent>;
  netbus: t.PeerNetbus;
  fs: t.Fs;
  signal: string; // Signalling server network address (host/path).
  events?: CtxEvents;
  connectTo?: string;
  toStrategy(): { peer: t.PeerStrategy; group: t.GroupStrategy };
  toFlags(): CtxDebugFlags;
  fullscreen(value: boolean): void;
};

type CtxDebugFlags = {
  isFullscreen: boolean;
  isReliable: boolean;
  debugJson: boolean;
  collapseData: boolean;
  collapseMedia: boolean;
  cardsMedia: boolean;
  cardsData: boolean;
  isLayoutFullscreen: boolean;
  showOthersInHeader: boolean;
};

type CtxEvents = {
  peer: t.PeerEvents;
  group: t.GroupEvents;
  media: t.MediaStreamEvents;
  runtime: t.WebRuntimeEvents;
};

const showLayout = (ctx: Ctx, kind: t.DevGroupLayout['kind'], props?: O) => {
  const { netbus } = toObject(ctx) as Ctx;
  const isLayoutFullscreen = ctx.toFlags().isLayoutFullscreen;
  const target: t.DevModalTarget = isLayoutFullscreen ? 'fullscreen' : 'body';
  netbus.fire({
    type: 'DEV/group/layout',
    payload: { kind, target, props },
  });
};

const DEFAULT = {
  signal: TEST.SIGNAL,
  fs: 'dev.net.fs',
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('DEV.Sample.App / 0.0.x')

  .context((e) => {
    if (e.prev) return e.prev;

    const { signal } = DEFAULT;
    const self = cuid();
    const bus = rx.bus<t.PeerEvent | t.DevEvent>();
    const instance = { bus };

    PeerNetwork.Controller({ bus });
    MediaStream.Controller({ bus });
    EventBridge.startEventBridge({ bus, self });

    const netbus = PeerNetbus({ bus, self });
    const runtime = WebRuntime.Bus.Controller({ instance, netbus });

    const events = {
      media: MediaStream.Events(bus),
      peer: PeerNetwork.PeerEvents(bus),
      group: PeerNetwork.GroupEvents(netbus),
      runtime,
    };

    const strategy = {
      peer: PeerNetwork.PeerStrategy({ bus, netbus }),
      group: PeerNetwork.GroupStrategy({ bus, netbus }),
    };

    const init = () => {
      events.media.start(EventBridge.videoRef(self)).video();
      events.peer.create(signal, { self });
      events.peer.media(self).video();
    };
    time.delay(100, init);

    events.peer.status(self).changed$.subscribe((e) => {
      console.log('NET/CHANGED', e);
    });

    const storage = LocalStorage<CtxDebugFlags>('sys.net/dev/PeerNetwork');

    // Default flag values (NB: state stored in localStorage).
    const flags = storage.object({
      isLayoutFullscreen: false,
      isFullscreen: true,
      isReliable: true,
      debugJson: false,
      collapseData: false,
      collapseMedia: false,
      cardsData: true,
      cardsMedia: false,
      showOthersInHeader: true,
    });
    storage.changed$.subscribe(() => e.redraw());

    /**
     * Filesystem (networked).
     */
    const filesystem = Filesystem.IndexedDb.create({ bus, fs: DEFAULT.fs });
    // res.
    Filesystem.IndexedDb.Network({ events: filesystem.events, netbus });
    (async () => {
      // const fs = await filesystem;
      // const events = Filesystem.Events({ bus, id: fs.id });
    })();

    return {
      self,
      bus,
      netbus,
      events,
      signal,
      connectTo: '',
      fs: filesystem.fs,
      // fs: async () => (await filesystem).fs,
      toFlags: () => flags,
      toStrategy: () => strategy,
      fullscreen: (value) => (flags.isFullscreen = value),
    };
  })

  .init(async (e) => {
    console.log('NET/INIT', toObject(e.ctx));

    const { bus } = e;
    const { signal } = DEFAULT;

    /**
     * TODO 🐷
     * - replace config below with [net]
     */
    const net = await PeerNetwork.start({ bus, signal });
    console.log('🐷🐷🐷🐷 TODO // net:', net);
  })

  .items((e) => {
    e.component((e) => {
      const { self, bus } = e.ctx;
      return <DevProps self={self} bus={bus} style={{ MarginX: 30, MarginY: 20 }} />;
    });

    e.hr();
    e.title('Install Module');

    e.component((e) => {
      const { ctx } = e;
      const bus = ctx.bus;
      const instance = { bus };

      return (
        <WebRuntime.UI.ManifestSelectorStateful
          instance={instance}
          style={{ MarginX: 30, MarginY: 20 }}
          history={{ fs: DEFAULT.fs }}
          onExportClick={(e) => {
            ctx.events?.runtime.useModule.fire({
              target: TARGET_NAME,
              module: e.module,
            });
          }}
        />
      );
    });

    e.hr();
  })

  .items((e) => {
    e.title('Layout');

    e.boolean('load as fullscreen', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.isLayoutFullscreen = e.changing.next;
      const value = flags.isLayoutFullscreen;
      e.boolean.current = value;
    });

    e.hr(1, 0.2);

    e.button('screensize', (e) => showLayout(e.ctx, 'screensize'));
    e.button('video/group', (e) => showLayout(e.ctx, 'video/group'));
    e.button('image/pasteboard', (e) => showLayout(e.ctx, 'image/pasteboard'));

    e.hr(1, 0.2);
    e.button('reset (default)', (e) => showLayout(e.ctx, 'cards'));

    e.hr();
  })

  .items((e) => {
    e.title('Environment');

    e.boolean('debug (json)', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.debugJson = e.changing.next;
      e.boolean.current = flags.debugJson;
    });

    e.button('debug (group)', async (e) => {
      const res = await e.ctx.events?.group.connections.get();

      console.group('🌳 Group');
      console.log('local', res?.local);
      console.log('remote', res?.remote);
      console.log('pending', res?.pending);

      console.groupEnd();
    });

    e.hr(1, 0.2);

    e.boolean('show others in header', (e) => {
      const flags = e.ctx.toFlags();
      if (e.changing) flags.showOthersInHeader = e.changing.next;
      e.boolean.current = flags.showOthersInHeader;
    });

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

    e.textbox((config) => {
      config
        .initial(config.ctx.signal)
        .title('Signal end-point:')
        .placeholder('url')
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
      events?.peer.create(signal, { self });
    });

    e.button('fire ⚡️ Peer:Local/purge', async (e) => {
      const self = e.ctx.self;
      const data = deleteUndefined((await e.ctx.events?.peer.purge(self).fire()) ?? {});
      e.button.description = (
        <ObjectView name={'purged'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire ⚡️ Peer:Local/status:refresh', async (e) => {
      const self = e.ctx.self;
      e.ctx.events?.peer.status(self).refresh();
    });

    e.hr(1, 0.2);

    e.button('fire ⚡️ Peer:Local/media (video)', async (e) => {
      const data = deleteUndefined((await e.ctx.events?.peer.media(e.ctx.self).video()) ?? {});
      e.button.description = (
        <ObjectView name={'media:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire ⚡️ Peer:Local/media (screen)', async (e) => {
      const data = deleteUndefined((await e.ctx.events?.peer.media(e.ctx.self).screen()) ?? {});
      e.button.description = (
        <ObjectView name={'media:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.hr(1, 0.2);

    e.button('fire ⚡️ Peer:Local/status', async (e) => {
      const self = e.ctx.self;
      const data = deleteUndefined((await e.ctx.events?.peer.status(self).get()) ?? {});
      e.button.description = (
        <ObjectView name={'status:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire ⚡️ Remote:exists (false)', async (e) => {
      const self = e.ctx.self;
      const remote = cuid();
      const res = await e.ctx.events?.peer.remote.exists.get({ self, remote });
      const data = { exists: Boolean(res?.exists) };
      e.button.description = (
        <ObjectView name={'exists:res'} data={data} fontSize={10} expandLevel={2} />
      );
    });

    e.button('fire ⚡️ Remote:exists (true)', async (e) => {
      const self = e.ctx.self;
      const status = (await e.ctx.events?.peer.status(self).get())?.peer;
      const first = (status?.connections ?? [])[0];
      const remote = first?.peer.remote.id;

      const description = (data: any) => {
        e.button.description = (
          <ObjectView name={'exists:res'} data={data} fontSize={10} expandLevel={2} />
        );
      };

      if (remote) {
        const res = await e.ctx.events?.peer.remote.exists.get({ self, remote });
        description({ exists: Boolean(res?.exists) });
      }
      if (!remote) {
        description({ error: `No remote connections to draw from` });
      }
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
        const res = await events?.peer.connection(self, connectTo).open.data({ isReliable });
        const name = res?.error ? 'Fail' : 'Success';
        const expandLevel = res?.error ? 1 : 0;
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
        label: {
          topLeft: 'Mesh',
          topRight: elLabelRight,
          bottomLeft: `bus/instance: "${rx.bus.instance(bus)}"`,
          bottomRight: `filesystem: "${DEFAULT.fs}"`,
        },
        position: [60, 60, 70, 60],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
      host: { background: -0.04 },
      actions: { width: 380 },
    });

    e.render(
      <DevRootLayout
        bus={bus}
        netbus={netbus}
        debugJson={flags.debugJson}
        collapse={{ data: flags.collapseData, media: flags.collapseMedia }}
        cards={{ data: flags.cardsData, media: flags.cardsMedia }}
        others={{ headerVideos: flags.showOthersInHeader }}
      />,
    );
  });

export default actions;
