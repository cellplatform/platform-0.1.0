import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { TEST } from '../../test';

import { DevNetworkCard } from '../NetworkCard/dev/DEV.NetworkCard';
import * as k from '../NetworkCard/types';
import {
  Button,
  Color,
  COLORS,
  css,
  CssValue,
  EventBridge,
  Fullscreen,
  Icons,
  Keyboard,
  MediaStream,
  PeerNetwork,
  PositioningLayout,
  rx,
  Spinner,
  t,
  WebRuntime,
} from './DEV.common';
import { DevOverlay } from './DEV.Overlay';

export type DevSampleAppProps = {
  allowRubberband?: boolean;
  style?: CssValue;
};

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const id = 'instance.app';
  const [network, setNetwork] = useState<t.PeerNetwork>();
  const bus = network?.bus ? rx.busAsType<k.NetworkCardEvent>(network?.bus) : undefined;

  const [overlay, setOverlay] = useState<undefined | t.NetworkCardOverlay>();
  const keybrd = Keyboard.useKeyboard({ bus, instance: id });
  const fullscreen = Fullscreen.useFullscreen();

  /**
   * Initialize network
   */
  useEffect(() => {
    Util.createNetwork().then((e) => setNetwork(e));
  }, []);

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
    base: css({ Absolute: 0, backgroundColor: Color.format(1) }),
    bg: css({ Absolute: 0, backgroundColor: Color.format(-0.06) }),
    layout: css({ Absolute: 0 }),
    networkCard: css({ pointerEvents: 'auto' }),
    fullscreen: css({ pointerEvents: 'auto' }),
  };

  const CardLayer: t.PositioningLayer = {
    id: 'layer.Card',
    position: { x: 'center', y: 'center' },
    render() {
      if (!network) return <Spinner />;
      return <DevNetworkCard instance={{ network, id }} style={styles.networkCard} />;
    },
  };

  const OverlayLayer: t.PositioningLayer = {
    id: 'layer.Overlay',
    position: { x: 'stretch', y: 'stretch' },
    render({ size }) {
      if (!overlay?.render) return null;
      if (!network) return null;

      return (
        <DevOverlay bus={network.bus} instance={id} style={styles.fullscreen}>
          {overlay.render({ size })}
        </DevOverlay>
      );
    },
  };

  const FullscreenLayer: t.PositioningLayer = {
    id: 'layer.Fullscreen',
    position: { x: 'right', y: 'top' },
    render(e) {
      const styles = {
        base: css({ pointerEvents: 'auto', Margin: [3, 4, null, null] }),
      };
      const Icon = fullscreen.isFullscreen ? Icons.FullScreen.Exit : Icons.FullScreen.Open;
      return (
        <Button style={styles.base} onClick={fullscreen.toggle}>
          <Icon color={Color.alpha(COLORS.DARK, 0.7)} />
        </Button>
      );
    },
  };

  const VersionLayer: t.PositioningLayer = {
    id: 'layer.Version',
    position: { x: 'right', y: 'bottom' },
    render(e) {
      const styles = {
        base: css({ pointerEvents: 'auto', Margin: [null, 10, 8, null] }),
        semver: css({ cursor: 'pointer', opacity: 0.5 }),
      };
      const href = `${location.origin}/?dev=Sample`;
      return (
        <a href={href} {...styles.base}>
          <Button>
            <WebRuntime.ui.ManifestSemver style={styles.semver} fontSize={11} />
          </Button>
        </a>
      );
    },
  };

  return (
    <div ref={fullscreen.ref} {...css(styles.base, props.style)}>
      <div {...styles.bg} />
      <PositioningLayout
        layers={[VersionLayer, FullscreenLayer, CardLayer, OverlayLayer]}
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
