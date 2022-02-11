import React from 'react';

import { OpenConnectionInput } from '../OpenConnection.Input';
import { color, COLORS, css, CssValue, LocalPeerCard, t } from './DEV.common';

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
      position: 'relative',
      PaddingX: 10,
      paddingTop: 10,
      paddingBottom: 4,
      backgroundColor: color.alpha(COLORS.DARK, 0.7),
      borderTop: `solid 1px ${color.format(-0.16)}`,
      borderRadius: `0 0 3px 3px`,
      boxShadow: `inset 0 2px 6px ${color.format(-0.4)}`,
    }),
    input: css({ flex: 1 }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <OpenConnectionInput onConnectRequest={startConnection} theme={'Dark'} style={styles.input} />
    </div>
  );
};
