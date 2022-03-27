import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { TEST } from '../../web.test';
import * as k from '../NetworkCard/types';
import {
  color,
  css,
  CssValue,
  EventBridge,
  Keyboard,
  MediaStream,
  PeerNetwork,
  PositioningLayout,
  rx,
  Spinner,
  t,
  WebRuntime,
  Button,
} from './DEV.common';
import { DevFullscreen } from './DEV.Fullscreen';
import { DevNetworkCard } from './DEV.NetworkCard';

export type DevSampleAppProps = { style?: CssValue };

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const [network, setNetwork] = useState<t.PeerNetwork>();

  const instance = 'instance.app';
  const bus = network?.bus ? rx.busAsType<k.NetworkCardEvent>(network?.bus) : undefined;

  useEffect(() => {
    Util.createNetwork().then((e) => setNetwork(e));
  }, []);

  const [overlay, setOverlay] = useState<undefined | t.NetworkCardOverlay>();
  const keybrd = Keyboard.useKeyboard({ bus, instance });

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
        filter((e) => e.payload.instance === instance),
      );

      rx.payload<k.NetworkCardOverlayEvent>($, 'sys.net/ui.NetworkCard/Overlay')
        .pipe()
        .subscribe((e) => setOverlay(e));

      const closeOverlay = () => {
        bus.fire({
          type: 'sys.net/ui.NetworkCard/Overlay',
          payload: { instance, render: undefined },
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
    base: css({
      Absolute: 0,
      backgroundColor: color.format(-0.04),
    }),
    layout: css({ Absolute: 0 }),
    networkCard: css({ pointerEvents: 'auto' }),
    fullscreen: css({ pointerEvents: 'auto' }),
  };

  const Card: t.PositioningLayer = {
    id: 'layer.Card',
    position: { x: 'center', y: 'center' },
    render() {
      if (!network) return <Spinner />;
      return (
        <DevNetworkCard
          instance={instance}
          network={network}
          showPlaceholder={true}
          style={styles.networkCard}
        />
      );
    },
  };

  const Overlay: t.PositioningLayer = {
    id: 'layer.Overlay',
    position: { x: 'stretch', y: 'stretch' },
    render({ size }) {
      if (!overlay?.render) return null;
      if (!network) return null;
      return (
        <DevFullscreen bus={network.bus} instance={instance} style={styles.fullscreen}>
          {overlay.render({ size })}
        </DevFullscreen>
      );
    },
  };

  const Version: t.PositioningLayer = {
    id: 'layer.Version',
    position: { x: 'right', y: 'top' },
    render(e) {
      const styles = {
        base: css({ pointerEvents: 'auto' }),
      };

      return (
        <Button
          style={styles.base}
          onClick={() => {
            // 🌳 Jump into "DevHarness" mode.
            location.href = `${location.origin}/?dev`;
          }}
        >
          <WebRuntime.ui.ManifestSemver style={{ marginTop: 10, marginRight: 15 }} />
        </Button>
      );
    },
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PositioningLayout
        layers={[Version, Card, Overlay]}
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
