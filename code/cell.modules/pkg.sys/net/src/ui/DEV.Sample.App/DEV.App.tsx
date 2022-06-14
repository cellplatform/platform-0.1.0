import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { TEST } from '../../test';
import { DevNetworkCard } from '../NetworkCard/dev/DEV.NetworkCard';
import * as k from '../NetworkCard/types';
import { DevBackground } from './DEV.Background';
import { DevButtonFullscreen } from './DEV.Button.Fullscreen';
import {
  Color,
  css,
  CssValue,
  Fullscreen,
  Keyboard,
  LocalPeerCard,
  MinSize,
  PositioningLayout,
  rx,
  Spinner,
  t,
} from './common';
import { DevEventLog } from './DEV.EventLog';
import { DevModule } from './DEV.Module';
import { DevOverlay } from './DEV.Overlay';
import { DevVersion } from './DEV.Version';
import { DevVideos } from './DEV.Videos';
import { DevTray } from './DEV.Tray';

export type DevSampleAppProps = {
  allowRubberband?: boolean;
  style?: CssValue;
  onReady?: (e: { network: t.PeerNetwork }) => void;
  onSize?: (e: { size: t.DomRect }) => void;
};

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const id = 'instance.app';
  const [network, setNetwork] = useState<t.PeerNetwork>();
  const bus = network?.bus ? rx.busAsType<k.NetworkCardEvent>(network?.bus) : undefined;
  const netbus = network?.netbus;
  const netbusExists = Boolean(netbus);

  const [overlay, setOverlay] = useState<undefined | t.NetworkCardOverlay>();
  const keybrd = Keyboard.useKeyboard({ bus, instance: id });
  const fullscreen = Fullscreen.useFullscreen();

  const [moduleUrl, setModuleUrl] = useState('');
  const [minimized, setMinimized] = useState(false);

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
    const cmd = args.cmd.trim();

    /**
     * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     * TODO 🐷
     *
     *  - parse and interpret the command text.
     *
     *
     * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     */

    const fireRemote = (event: t.Event) => {
      netbus.target.remote(event);
    };

    // if (cmd === 'tmp') {
    //   const ev = CmdCard.Events({ instance: { bus, id } });
    //   await time.wait(10);
    //   const res = await ev.state.patch((f) => {
    //     f.commandbar.text = 'hello';
    //     f.commandbar.textbox.spinning = true;
    //   });
    //   console.log('res', res);
    // }

    if (cmd.startsWith('fire ')) {
      const type = cmd.substring(cmd.indexOf(' '));
      if (type) fireRemote({ type, payload: { msg: 'hello' } });
    }

    if (cmd.startsWith('remote ') || cmd.startsWith('rem ')) {
      const text = cmd.substring(cmd.indexOf(' '));
      fireRemote({
        type: 'remote:cmd',
        payload: { cmd: text },
      });
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

      const url = `https://${stripHttp(domain).trim()}/index.json?entry=./${entry}`;
      console.log('LOAD remote url:', url);
      setModuleUrl(url);
    }

    if (cmd.startsWith('unload')) setModuleUrl('');
    if (cmd === 'minimize' || cmd === 'min') setMinimized(true);
    if (cmd === 'maximize' || cmd === 'max') setMinimized(false);
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

      rx.payload<k.NetworkCardOverlayEvent>($, 'sys.net/ui.NetworkCard/Overlay')
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
      const style = css({
        flex: 1,
        pointerEvents: 'auto',
        opacity: moduleUrl ? 0 : 1,
        transition: `opacity 500ms`,
      });
      return <DevBackground style={style} />;
    },
  };

  const ImportedModuleLayer: t.PositioningLayer = {
    id: 'layer.Module',
    position: { x: 'stretch', y: 'stretch' },
    render(e) {
      if (!bus) return null;
      if (!moduleUrl) return null;
      return <DevModule bus={bus} url={moduleUrl} />;
    },
  };

  const CardLayer: t.PositioningLayer = {
    id: 'layer.Card',
    position: {
      x: 'center',
      y: minimized ? 'bottom' : 'center',
    },
    render(e) {
      if (!network) return <Spinner />;
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
            CardLayer,
            OverlayLayer,
          ]}
          style={styles.layout}
          childPointerEvents={'none'}
        />
      </MinSize>
    </div>
  );
};
