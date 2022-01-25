import React from 'react';
import { css, CssValue, t, LocalPeerProps } from './DEV.common';
import { useLocalPeer } from '../hooks';

export type DevPropsProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const DevProps: React.FC<DevPropsProps> = (props) => {
  const { self, bus } = props;

  const local = useLocalPeer({
    self,
    bus,
    onChange(e) {
      // console.log('useLocalPeer.onChange:', e);
    },
  });
  const status = local.status;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
  };

  const elLocalPeer = status && (
    <LocalPeerProps
      self={{ id: self, status }}
      bus={bus}
      newConnections={{ isReliable: true, autoStartVideo: false }}
    />
  );

  return <div {...css(styles.base, props.style)}>{elLocalPeer}</div>;
};
