import React from 'react';

import { Filter } from '../util';
import { css, CssValue, t } from './common';
import { Connection } from './DEV.Connection';
import { NetworkPropList } from './DEV.Network.PropList';
import { VideoSelf } from './DEV.VideoSelf';
import { Hr } from 'sys.ui.primitives/lib/components/Hr';
import { EventStack } from './DEV.EventStack';

export type NetworkProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  network: t.PeerNetworkStatus;
  style?: CssValue;
};

export const Network: React.FC<NetworkProps> = (props) => {
  const { network, netbus } = props;
  const bus = props.bus.type<t.PeerEvent>();

  const connections = {
    data: Filter.connectionsAs<t.PeerConnectionDataStatus>(network.connections, 'data'),
    media: Filter.connectionsAs<t.PeerConnectionMediaStatus>(network.connections, 'media'),
  };

  const styles = {
    base: css({}),
    header: css({ Flex: 'horizontal-spaceBetween-start' }),
    body: css({ display: 'flex', flexWrap: 'wrap' }),
  };

  const cardMargin = 20;

  const elDataConnections = connections.data.map((item, i) => {
    const isLast = i === network.connections.length - 1;
    return (
      <Connection
        key={item.id.remote}
        bus={bus}
        netbus={netbus}
        connection={item}
        isLast={isLast}
        margin={cardMargin}
      />
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.header}>
        <NetworkPropList network={network} />
        <VideoSelf networkRef={network.id} bus={bus} isOffline={!network.isOnline} />
      </div>
      <Hr thickness={10} opacity={0.06} />
      <div {...styles.body}>{elDataConnections}</div>
    </div>
  );
};
