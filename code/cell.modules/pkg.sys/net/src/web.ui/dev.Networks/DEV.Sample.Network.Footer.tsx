import React from 'react';

import { OpenConnectionInput } from '../OpenConnection.Input';
import { color, css, CssValue, LocalPeerCard, t } from './DEV.common';

export type DevSampleNetworkFooterProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  style?: CssValue;
};

export const DevSampleNetworkFooter: React.FC<DevSampleNetworkFooterProps> = (props) => {
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
      PaddingX: 15,
      PaddingY: 10,
      backgroundColor: color.format(-0.03),
      borderTop: `solid 1px ${color.format(-0.12)}`,
      boxShadow: `inset 0 2px 6px ${color.format(-0.06)}`,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <OpenConnectionInput onConnectRequest={startConnection} />
    </div>
  );
};
