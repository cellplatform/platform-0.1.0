import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { TEST } from '../../test';
import { DevNetworkCard } from '../Network.Card/dev/DEV.NetworkCard';
import {
  CmdBar,
  Color,
  css,
  CssValue,
  Fullscreen,
  Keyboard,
  LocalPeerCard,
  MinSize,
  PositioningLayout,
  rx,
  t,
  WebRuntimeBus,
  LoadMask,
} from './common';
import { DevBackground } from './DEV.Background';
import { DevButtonFullscreen } from './DEV.Button.Fullscreen';
import { DevEventLog } from './DEV.EventLog';
import { DevModule } from './DEV.ModuleLoader';
import { DevOverlay } from './DEV.Overlay';
import { DevTray } from './DEV.Tray';
import { DevVersion } from './DEV.Version';
import { DevVideos } from './DEV.Videos';

export type DevSampleAppProps = {
  allowRubberband?: boolean;
  style?: CssValue;
  onSize?: (e: { size: t.DomRect }) => void;
  onReady?: (e: { network: t.PeerNetwork }) => void;
};

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const id = 'instance.app';
  const [network, setNetwork] = useState<t.PeerNetwork>();
  const bus = network?.bus ? network.bus : undefined;
  const netbus = network?.netbus;
  const netbusExists = Boolean(netbus);
  const busExists = Boolean(bus);

  const [overlay, setOverlay] = useState<undefined | t.NetworkCardOverlay>();
  const keybrd = Keyboard.useKeyboard({ bus, instance: id });
  const fullscreen = Fullscreen.useFullscreen();

  const [moduleUrl, setModuleUrl] = useState('');
  const [minimized, setMinimized] = useState(false);

  /**
   * Keyboard controller
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    if (bus) {
      const cmdBar = CmdBar.Events({ instance: { bus, id }, dispose$ });

      keybrd.state$
        .pipe(
          map((e) => e.current),
          filter((e) => e.modifiers.meta),
          filter((e) => e.pressed[0]?.key === 'k'),
        )
        .subscribe((e) => {
          cmdBar.textbox.focus();
        });
    }

    return dispose;
  }, [busExists]); // eslint-disable-line

  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    netbus?.$.pipe(takeUntil(dispose$)).subscribe(async (e) => {
      const cmd = e.payload.cmd as string;

      /**
       * TODO 🐷
       * - Execute the incoming remote command.
       * - Check VC (Credentials) and Auth permissions on whether the incoming DID is
       *   allowed to run that command within your ENV.
       */
      console.group('🌳 🚀⚡️ REMOTE SECRUITY/TODO');
      console.warn('Ensure remote execution is allowed!!!');
      console.log('event:', e);
      console.log('cmd:', cmd);
      console.groupEnd();

      if (bus && netbus && network) {
        await runCommand({ cmd, bus, netbus, network });
      }
    });

    return dispose;
  }, [netbusExists]); // eslint-disable-line

  const runCommand = async (args: {
    cmd: string;
    bus: t.EventBus<any>;
    netbus: t.PeerNetbus;
    network: t.PeerNetwork;
  }) => {
    const { bus, netbus, network } = args;
    const cmd = (args.cmd ?? '').trim();

    /**
     * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     * TODO 🐷
     *
     *  - parse and interpret the command text.
     *
     *
     * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     */

    const fireRemote = (args: { all: boolean }) => {
      const event = {
        type: 'remote:cmd',
        payload: { cmd: cmd.substring(cmd.indexOf(' ')) },
      };
      if (args.all) netbus.fire(event);
      if (!args.all) netbus.target.remote(event);
    };

    if (cmd.startsWith('fire ')) {
      const type = cmd.substring(cmd.indexOf(' '));
      if (type) {
        netbus.fire({ type, payload: { msg: 'hello' } });
      }
    }

    if (cmd.startsWith('all ')) fireRemote({ all: true });
    if (cmd.startsWith('rem ')) fireRemote({ all: false });

    if (cmd.startsWith('video')) {
      if (cmd === 'video close') {
        /**
         * Close the child card.
         */
        bus.fire({
          type: 'sys.net/ui.NetworkCard/CloseChild',
          payload: { instance: id },
        });
      } else {
        /**
         * Load first remote peer video into the child card.
         */
        const connections = network.status.current.connections;
        type M = t.PeerConnectionMediaStatus;
        const first = connections.find((conn) => conn.kind === 'media/video') as M;

        if (first) {
          const bus = rx.busAsType<t.NetworkCardEvent>(network.bus);
          const peer = first.id;
          const media = first.media;
          bus.fire({
            type: 'sys.net/ui.NetworkCard/PeerClick',
            payload: { instance: id, network, peer, media },
          });
        }
      }
    }

    const isCuid = (input: string) => input.startsWith('c') && input.length === 25;
    if (cmd.startsWith('peer:') || isCuid(cmd)) {
      const remote = cmd;
      const self = network.self;
      const isReliable = true;
      const autoStartVideo = true;
      await LocalPeerCard.connect({ bus, remote, self, isReliable, autoStartVideo });
    }

    if (cmd.startsWith('load ')) {
      const input = cmd.substring(cmd.indexOf(' ')).trim();
      if (!input) return setModuleUrl('');

      const stripHttp = (input?: string) => {
        return (input || '')
          .replace(/^http\:/, '')
          .replace(/^https\:/, '')
          .replace(/^\/\//, '');
      };

      const [domain, entry] = input.split(' ');
      const url = new URL(`https://${stripHttp(domain).trim()}/index.json`);
      if (entry) {
        const value = `./${entry.replace(/^\.\//, '')}`;
        url.searchParams.set('entry', value);
      }

      console.log('LOAD remote url:', url.href);
      setModuleUrl(url.href);
    }

    if (cmd.startsWith('unload')) setModuleUrl('');
    if (cmd === 'min') setMinimized(true);
    if (cmd === 'max') setMinimized(false);

    if (['copy peer', 'copy', 'cp'].includes(cmd)) {
      const peer = `peer:${network.self}`;
      const domain = `${location.origin}`;
      const text = `${domain}\n${peer}`;
      navigator.clipboard.writeText(text);
    }
  };

  /**
   * TODO 🐷 HACK
   *    Move to sensible place (and put within a
   *    formal "language command pack" (aka. a "grammar")).
   */
  const executeCommand__TEMP: t.CmdCardExecuteCommandHandler = async (e) => {
    if (!netbus) return;
    if (!bus) return;
    if (!network) return;

    const cmd = e.text;
    return runCommand({ cmd, bus, netbus, network });
  };

  /**
   * Initialize network
   */
  useEffect(() => {
    TEST.createNetwork().then((network) => {
      setNetwork(network);

      const { bus, netbus } = network;
      WebRuntimeBus.Controller({ instance: { bus }, netbus });

      props.onReady?.({ network });
    });
  }, []); // eslint-disable-line

  /**
   * Initialize page
   */
  useEffect(() => {
    const allow = props.allowRubberband ?? false;
    document.body.style.overflow = allow ? 'auto' : 'hidden';
  }, [props.allowRubberband]);

  /**
   * TEMP - Overlay  🐷
   * Behavior/Controller
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const keyboard = keybrd.events({ dispose$ });

    if (bus) {
      const $ = bus.$.pipe(
        takeUntil(dispose$),
        filter((e) => e.payload.instance === id),
      );

      rx.payload<t.NetworkCardOverlayEvent>($, 'sys.net/ui.NetworkCard/Overlay')
        .pipe()
        .subscribe((e) => setOverlay(e));

      const closeOverlay = () => {
        bus.fire({
          type: 'sys.net/ui.NetworkCard/Overlay',
          payload: { instance: id, render: undefined },
        });
      };

      keyboard.down.escape((e) => closeOverlay());
    }

    return () => rx.done(dispose$);
  }, [bus, keybrd]);

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, backgroundColor: Color.format(1), overflow: 'hidden' }),
    bg: css({ Absolute: 0, backgroundColor: Color.format(-0.06) }),
    layout: css({ Absolute: 0 }),
  };

  const BackgroundLayer: t.PositioningLayer = {
    id: 'layer.BG',
    position: { x: 'stretch', y: 'stretch' },
    render(e) {
      if (!network) return null;
      const style = css({
        flex: 1,
        pointerEvents: 'auto',
        opacity: moduleUrl ? 0 : 1,
        transition: `opacity 500ms`,
      });
      return <DevBackground instance={{ network, id }} style={style} />;
    },
  };

  const ImportedModuleLayer: t.PositioningLayer = {
    id: 'layer.Module',
    position: { x: 'stretch', y: 'stretch' },
    render(e) {
      if (!bus) return null;
      if (!moduleUrl) return null;
      return (
        <DevModule
          bus={bus}
          url={moduleUrl}
          onExportClick={(e) => {
            setModuleUrl(e.url);
          }}
        />
      );
    },
  };

  const CardLayer: t.PositioningLayer = {
    id: 'layer.Card',
    position: {
      x: 'center',
      y: minimized ? 'bottom' : 'center',
    },
    render(e) {
      if (!network) return null;
      const styles = {
        base: css({
          pointerEvents: 'auto',
          Margin: minimized ? [null, null, 15, null] : undefined,
        }),
      };

      const elTray = <DevTray instance={{ network, id }} />;

      return (
        <DevNetworkCard
          instance={{ network, id }}
          style={styles.base}
          minimized={minimized}
          tray={elTray}
          onExecuteCommand={executeCommand__TEMP}
        />
      );
    },
  };

  const VideosLayer: t.PositioningLayer = {
    id: 'layer.Videos',
    position: { x: 'left', y: 'bottom' },
    render(e) {
      if (!network) return null;
      if (!minimized) return null;

      const styles = {
        base: css({
          pointerEvents: 'auto',
          Margin: [null, null, 15, 15],
        }),
      };

      return (
        <DevVideos
          instance={{ network, id }}
          style={styles.base}
          video={{ width: 64, height: 64, radius: 6 }}
        />
      );
    },
  };

  const LogLayer: t.PositioningLayer = {
    id: 'layer.Card.Log',
    position: { x: 'stretch', y: 'stretch' },
    render(e) {
      if (minimized) return;
      if (moduleUrl) return null;

      const card = e.find.first(CardLayer.id);
      if (!network || !card) return null;
      return <DevEventLog network={network} sizes={{ root: e.size, card: card.size }} />;
    },
  };

  const OverlayLayer: t.PositioningLayer = {
    id: 'layer.Overlay',
    position: { x: 'stretch', y: 'stretch' },
    render({ size }) {
      if (!overlay?.render) return null;
      if (!network) return null;

      const styles = { base: css({ pointerEvents: 'auto' }) };
      return (
        <DevOverlay bus={network.bus} instance={id} style={styles.base}>
          {overlay.render({ size })}
        </DevOverlay>
      );
    },
  };

  const FullscreenButtonLayer: t.PositioningLayer = {
    id: 'layer.Fullscreen',
    position: { x: 'right', y: 'top' },
    render(e) {
      if (moduleUrl) return null;
      return (
        <DevButtonFullscreen isFullscreen={fullscreen.isFullscreen} onClick={fullscreen.toggle} />
      );
    },
  };

  const VersionLayer: t.PositioningLayer = {
    id: 'layer.Version',
    position: { x: 'right', y: 'bottom' },
    render(e) {
      return <DevVersion style={{ Margin: [null, 8, 8, null] }} />;
    },
  };

  const LoadMaskLayer: t.PositioningLayer = {
    id: 'layer.LoadMask',
    position: { x: 'stretch', y: 'stretch' },
    render(e) {
      if (network) return null;
      return <LoadMask style={{ Absolute: 0 }} />;
    },
  };

  return (
    <div ref={fullscreen.ref} {...css(styles.base, props.style)}>
      <MinSize
        minWidth={620}
        minHeight={330}
        style={{ Absolute: 0 }}
        onResize={(e) => props.onSize?.(e)}
      >
        <div {...styles.bg} />
        <PositioningLayout
          layers={[
            BackgroundLayer,
            LogLayer,
            VersionLayer,
            FullscreenButtonLayer,
            ImportedModuleLayer,
            // VideosLayer,
            OverlayLayer,
            CardLayer,
            LoadMaskLayer,
          ]}
          style={styles.layout}
          childPointerEvents={'none'}
        />
      </MinSize>
    </div>
  );
};
