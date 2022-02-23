import React, { useEffect, useState } from 'react';

import { TEST } from '../../web.test';
import {
  color,
  css,
  CssValue,
  EventBridge,
  MediaStream,
  PeerNetwork,
  rx,
  t,
  useEventBusHistory,
} from './DEV.common';
import { DevNetworkCard } from './DEV.NetworkCard';

import { EventList } from 'sys.ui.primitives/lib/ui/Event.List';

export type DevSampleAppProps = { style?: CssValue };

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const [network, setNetwork] = useState<t.PeerNetwork>();
  const instance = 'instance.app';
  const history = useEventBusHistory(network?.netbus, { insertAt: 'Start' });

  useEffect(() => {
    createNetwork().then((e) => setNetwork(e));
  }, []);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: color.format(-0.04),
      Flex: 'x-stretch-stretch',
    }),
    left: css({ Flex: 'y-center-center', flex: 1 }),
    right: css({ width: 300, display: 'flex', paddingRight: 6 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        {network && <DevNetworkCard instance={instance} network={network} showPlaceholder={true} />}
      </div>
      <div {...styles.right}>
        <EventList items={history.events} style={{ flex: 1 }} />
      </div>
    </div>
  );
};

async function createNetwork() {
  const bus = rx.bus();
  const signal = TEST.SIGNAL;
  const { network } = await PeerNetwork.start({ bus, signal });
  const self = network.self;

  MediaStream.Controller({ bus });
  EventBridge.startEventBridge({ self, bus });

  return network;
}
