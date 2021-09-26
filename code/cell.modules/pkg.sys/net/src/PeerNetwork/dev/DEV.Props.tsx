import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { LocalPeerProps } from '../components/LocalPeerProps';
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
    <LocalPeerProps self={self} status={status} bus={bus} allowNewConnections={true} />
  );

  return <div {...css(styles.base, props.style)}>{elLocalPeer}</div>;
};
