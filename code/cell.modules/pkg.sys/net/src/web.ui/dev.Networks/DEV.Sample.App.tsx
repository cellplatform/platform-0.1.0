import React, { useEffect, useState } from 'react';

import { TEST } from '../../web.test';
import { color, css, CssValue, EventBridge, MediaStream, PeerNetwork, rx, t } from './DEV.common';
import { DevNetworkCard } from './DEV.NetworkCard';

export type DevSampleAppProps = { style?: CssValue };

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const [network, setNetwork] = useState<t.PeerNetwork>();
  const instance = 'instance.foo';

  useEffect(() => {
    createNetwork().then((e) => setNetwork(e));
  }, []);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'y-center-center',
      backgroundColor: color.format(-0.04),
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      {network && <DevNetworkCard instance={instance} network={network} />}
    </div>
  );
};

async function createNetwork() {
  const bus = rx.bus();
  const signal = TEST.SIGNAL;
  const { network } = await PeerNetwork.start({ bus, signal });

  MediaStream.Controller({ bus });
  EventBridge.startEventBridge({ self: network.netbus.self, bus });

  return network;
}
