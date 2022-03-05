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
  COLORS,
} from './DEV.common';
import { DevEventList } from './DEV.EventList';
import { DevNetworkCard } from './DEV.NetworkCard';

export type DevSampleAppProps = { style?: CssValue };

export const DevSampleApp: React.FC<DevSampleAppProps> = (props) => {
  const [network, setNetwork] = useState<t.PeerNetwork>();
  const instance = 'instance.app';

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
    right: css({
      width: 300,
      paddingTop: 10,
      paddingLeft: 10,
      borderLeft: `solid 1px ${color.format(-0.04)}`,
      backgroundColor: color.alpha(COLORS.DARK, 0.03),
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        {network && <DevNetworkCard instance={instance} network={network} showPlaceholder={true} />}
      </div>
      {network && <DevEventList network={network} style={styles.right} />}
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
