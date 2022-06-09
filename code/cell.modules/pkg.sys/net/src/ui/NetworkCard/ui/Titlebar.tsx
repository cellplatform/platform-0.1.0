import React, { useState } from 'react';

import { COLORS, Color, css, CssValue, Event, Icons, t } from '../common';

export type NetworkCardTitlebarProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  style?: CssValue;
};

export const NetworkCardTitlebar: React.FC<NetworkCardTitlebarProps> = (props) => {
  const { network } = props.instance;
  const self = network.self;
  const iconSize = 20;

  const [status, setStatus] = useState<t.PeerStatus>();
  const totalConnections = status?.connections.length ?? 0;
  const hasPeers = totalConnections > 0;

  /**
   * [Lifecycle]
   */
  const events = Event.useEventsRef(() => network.events.peer.clone());
  events.status(self).changed$.subscribe((e) => setStatus(e.peer));

  /**
   * [Render]
   */
  const styles = {
    title: css({ paddingLeft: 5 }),
    icons: css({ Flex: 'x-center-center', marginRight: 0 }),
    icon: css({
      position: 'relative',
      top: 0,
      marginRight: 10,
      ':last-child': { marginRight: 0 },
    }),
  };

  return (
    <>
      <div {...css(styles.title)}>{'Peer'}</div>
      <div {...styles.icons}>
        {/* <Icons.FsNetworkDrive style={styles.icon} size={iconSize} opacity={0.7} /> */}
        {/* <Icons.Bus style={styles.icon} size={iconSize} opacity={ENABLED} /> */}
        <Icons.Antenna
          style={styles.icon}
          size={iconSize}
          color={Color.alpha(COLORS.DARK, hasPeers ? 0.7 : 0.1)}
        />
      </div>
    </>
  );
};
