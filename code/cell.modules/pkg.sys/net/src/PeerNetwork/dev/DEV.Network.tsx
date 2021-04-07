import React from 'react';
import { Hr } from 'sys.ui.primitives/lib/components/Hr';

import { css, CssValue, t } from './common';
import { Connection } from './DEV.Connection';
import { DevVideoSelf } from './DEV.Video.Self';
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

  const PADDING = {
    HEADER: 15,
    CARD: 25,
  };

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      boxSizing: 'border-box',
    }),
    header: css({
      Flex: 'horizontal-spaceBetween-start',
      padding: PADDING.HEADER,
    }),
    body: {
      base: css({ flex: 1, position: 'relative' }),
      scroll: css({
        Absolute: 0,
        Scroll: true,
        display: 'flex',
        flexWrap: 'wrap',
        paddingBottom: 80,
        paddingRight: PADDING.CARD,
      }),
    },
  };

  const connections = status.connections;
  const elConnections = connections.map((item, i) => {
    const isLast = i === connections.length - 1;
    return (
      <Connection
        key={item.uri}
        bus={bus}
        netbus={netbus}
        connection={item}
        isLast={isLast}
        margin={[PADDING.CARD, 0, 0, PADDING.CARD]}
      />
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.header}>
        <SelfPropList status={status} />
        <DevVideoSelf peer={status.id} bus={bus} />
      </div>
      <Hr thickness={10} opacity={0.05} margin={0} />
      <div {...styles.body.base}>
        <div {...styles.body.scroll}>{elConnections}</div>
      </div>
    </div>
  );
};
