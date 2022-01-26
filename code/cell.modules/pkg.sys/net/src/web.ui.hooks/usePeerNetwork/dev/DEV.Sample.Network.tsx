import React from 'react';
import { ObjectView } from 'sys.ui.dev';

import { usePeerNetwork } from '..';
import { css, CssValue, t, useLocalPeer, LocalPeerProps, Card } from './DEV.common';

export type DevSampleNetworkProps = {
  network: t.DevNetwork;
  style?: CssValue;
};

export const DevSampleNetwork: React.FC<DevSampleNetworkProps> = (props) => {
  const { network } = props;
  const { self, bus } = network;

  const net = usePeerNetwork({ bus }); // TEMP 🐷

  const peer = useLocalPeer({ self, bus });
  const status = peer.status;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      minWidth: 480,
      minHeight: 200,
      padding: 15,
      Flex: 'horizontal-start-start',
      marginBottom: 20,
      ':last-child': { marginBottom: 0 },
    }),
    peerProps: css({
      marginRight: 30,
    }),
  };

  return (
    <Card style={css(styles.base, props.style)}>
      <div {...styles.peerProps}>
        {status && <LocalPeerProps bus={bus} self={{ id: self, status }} newConnections={true} />}
      </div>
      <div>
        <ObjectView name={'peer'} data={peer} fontSize={12} />
      </div>
    </Card>
  );
};
