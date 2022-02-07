import React from 'react';

import { css, CssValue, LocalPeerCard, t } from './DEV.common';

export type DevPropsProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const DevProps: React.FC<DevPropsProps> = (props) => {
  const { self, bus } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
  };

  const elLocalPeer = (
    <LocalPeerCard
      self={self}
      bus={bus}
      openConnectionOptions={{ isReliable: true, autoStartVideo: false }}
    />
  );

  return <div {...css(styles.base, props.style)}>{elLocalPeer}</div>;
};
