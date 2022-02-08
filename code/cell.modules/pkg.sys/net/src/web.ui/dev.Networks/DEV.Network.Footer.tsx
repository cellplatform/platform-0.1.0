import React from 'react';

import { OpenConnectionInput } from '../OpenConnection.Input';
import { color, css, CssValue, LocalPeerCard, t, Icons } from './DEV.common';

export type DevNetworkFooterProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  style?: CssValue;
};

export const DevNetworkFooter: React.FC<DevNetworkFooterProps> = (props) => {
  const { bus, self } = props;

  /**
   * Initiate a new connection.
   */
  const startConnection = (args: { remote: t.PeerId }) => {
    const isReliable = true;
    const autoStartVideo = true;
    const { remote } = args;
    return LocalPeerCard.connect({ bus, remote, self, isReliable, autoStartVideo });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      PaddingX: 10,
      paddingTop: 10,
      paddingBottom: 6,
      backgroundColor: color.format(-0.02),
      borderTop: `solid 1px ${color.format(-0.16)}`,
      boxShadow: `inset 0 2px 6px ${color.format(-0.03)}`,
    }),
    body: css({
      Flex: 'x-stretch-stretch',
    }),
    termincalIcon: css({
      position: 'relative',
      top: -1,
      marginRight: 6,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <Icons.Terminal style={styles.termincalIcon} />
        <OpenConnectionInput onConnectRequest={startConnection} style={{ flex: 1 }} />
      </div>
    </div>
  );
};
