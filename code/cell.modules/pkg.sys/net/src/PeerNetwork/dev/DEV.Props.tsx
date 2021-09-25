import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { LocalPeerProps } from '../components/LocalPeerProps';
import { useLocalPeer } from '../hook/useLocalPeer';

export type DevPropsProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus?: t.PeerNetworkBus<any>;
  style?: CssValue;
};

export const DevProps: React.FC<DevPropsProps> = (props) => {
  const { self, bus } = props;

  const local = useLocalPeer({ self, bus, netbus: props.netbus });
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
