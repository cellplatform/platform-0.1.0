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
  EventBridge,
  Fullscreen,
  Keyboard,
  LocalPeerCard,
  MediaStream,
  PeerNetwork,
  PositioningLayout,
  rx,
  Spinner,
  t,
} from './DEV.common';
import { DevLog } from './DEV.Log';
import { DevOverlay } from './DEV.Overlay';
import { DevVersion } from './DEV.Version';

export type DevSampleAppProps = {
  allowRubberband?: boolean;
  style?: CssValue;
  onReady?: (e: { network: t.PeerNetwork }) => void;
};

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const id = 'instance.app';
  const [network, setNetwork] = useState<t.PeerNetwork>();
  const bus = network?.bus ? rx.busAsType<k.NetworkCardEvent>(network?.bus) : undefined;
  const netbus = network?.netbus;

  const [overlay, setOverlay] = useState<undefined | t.NetworkCardOverlay>();
  const keybrd = Keyboard.useKeyboard({ bus, instance: id });
  const fullscreen = Fullscreen.useFullscreen();

  /**
   * TODO 🐷 HACK
   *    Move to sensible place (and put within a
   *    formal "language command pack" (aka. a "grammar")).
   */
  const executeCommand__TEMP: t.CmdCardExecuteCommandHandler = async (e) => {
    if (!netbus) return;
    if (!bus) return;
    if (!network) return;

    const text = e.text.trim();

    /**
     * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     * TODO 🐷
     * - parse and interpret the command text.
     *
     * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     */

    if (text.startsWith('fire ')) {
      const type = text.substring(text.indexOf(' '));
      if (type) {
        console.log('fire');
        netbus.target.remote({ type, payload: { msg: 'hello' } });
      }
    }

    const isCuid = (input: string) => input.startsWith('c') && input.length === 25;
    if (text.startsWith('peer:') || isCuid(text)) {
      const remote = text;
      const self = network.self;
      const isReliable = true;
      const autoStartVideo = true;
      await LocalPeerCard.connect({ bus, remote, self, isReliable, autoStartVideo });
    }
  };

  /**
   * Initialize network
   */
  useEffect(() => {
    Util.createNetwork().then((network) => {
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
      const style = css({ flex: 1, pointerEvents: 'auto' });
      return <DevBackground style={style} />;
    },
  };

  const CardLayer: t.PositioningLayer = {
    id: 'layer.Card',
    position: { x: 'center', y: 'center' },
    render(e) {
      if (!network) return <Spinner />;
      const styles = { base: css({ pointerEvents: 'auto' }) };
      return (
        <DevNetworkCard
          instance={{ network, id }}
          style={styles.base}
          onExecuteCommand={executeCommand__TEMP}
        />
      );
    },
  };

  const LogLayer: t.PositioningLayer = {
    id: 'layer.Card.Log',
    position: { x: 'stretch', y: 'stretch' },
    render(e) {
      const card = e.find.first(CardLayer.id);
      if (!network || !card) return null;
      return <DevLog network={network} sizes={{ root: e.size, card: card.size }} />;
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

  const FullscreenLayer: t.PositioningLayer = {
    id: 'layer.Fullscreen',
    position: { x: 'right', y: 'top' },
    render(e) {
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
      <div {...styles.bg} />
      <PositioningLayout
        layers={[BackgroundLayer, LogLayer, VersionLayer, FullscreenLayer, CardLayer, OverlayLayer]}
        style={styles.layout}
        childPointerEvents={'none'}
      />
    </div>
  );
};

/**
 * [Helpers]
 */

const Util = {
  /**
   * Initialize a new network instance (controller AND client).
   */
  async createNetwork() {
    const bus = rx.bus();
    const signal = TEST.SIGNAL;
    const { network } = await PeerNetwork.start({ bus, signal });
    const self = network.self;

    MediaStream.Controller({ bus });
    EventBridge.startEventBridge({ self, bus });

    return network;
  },
};
