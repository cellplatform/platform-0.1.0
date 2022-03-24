import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { TEST } from '../../web.test';
import * as k from '../NetworkCard/types';
import {
  color,
  css,
  CssValue,
  EventBridge,
  MediaStream,
  PeerNetwork,
  PositioningLayout,
  rx,
  Spinner,
  t,
  useResizeObserver,
} from './DEV.common';
import { DevFullscreen } from './DEV.Fullscreen';
import { DevNetworkCard } from './DEV.NetworkCard';

export type DevSampleAppProps = { style?: CssValue };

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const [network, setNetwork] = useState<t.PeerNetwork>();
  const instance = 'instance.app';

  useEffect(() => {
    Util.createNetwork().then((e) => setNetwork(e));
  }, []);

  const [overlay, setOverlay] = useState<undefined | t.NetworkCardOverlay>();

  /**
   * TEMP - Overlay  🐷
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();

    if (network) {
      const bus = rx.busAsType<k.NetworkCardEvent>(network.bus);
      const $ = bus.$.pipe(
        takeUntil(dispose$),
        filter((e) => e.payload.instance === instance),
      );

      rx.payload<k.NetworkCardOverlayEvent>($, 'sys.net/ui.NetworkCard/Overlay')
        .pipe()
        .subscribe((e) => setOverlay(e));
    }

    return () => dispose$.next();
  }, [network]);

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
    id: 'card',
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
    id: 'overlay',
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

  return (
    <div {...css(styles.base, props.style)}>
      <PositioningLayout
        layers={[Card, Overlay]}
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
