import React from 'react';
import { Hr } from 'sys.ui.primitives/lib/components/Hr';

import { css, CssValue, t } from './common';
import { Connection } from './DEV.Connection';
import { DevVideo } from './DEV.Media.Video';
import { SelfPropList } from './DEV.Self.PropList';

export type NetworkProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  status: t.PeerStatus;
  style?: CssValue;
};

export const Network: React.FC<NetworkProps> = (props) => {
  const { status, netbus } = props;
  const bus = props.bus.type<t.PeerEvent>();

  const styles = {
    base: css({}),
    header: css({ Flex: 'horizontal-spaceBetween-start' }),
    body: css({ display: 'flex', flexWrap: 'wrap' }),
  };

  const connections = status.connections;
  const elConnections = connections.map((item, i) => {
    const isLast = i === connections.length - 1;
    const key = `${item.id.remote}:${item.kind}`;
    return (
      <Connection
        key={key}
        bus={bus}
        netbus={netbus}
        connection={item}
        isLast={isLast}
        margin={20}
      />
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.header}>
        <SelfPropList status={status} />
        <DevVideo peerId={status.id} bus={bus} />
      </div>
      <Hr thickness={10} opacity={0.06} margin={[30, 0, 20, 0]} />
      <div {...styles.body}>{elConnections}</div>
    </div>
  );
};
