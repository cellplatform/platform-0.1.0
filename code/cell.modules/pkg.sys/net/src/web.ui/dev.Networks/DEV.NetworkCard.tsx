import React from 'react';

import { DevCrdtCard } from './DEV.Card.Crdt';
import { DevFsCard } from './DEV.Card.Fs';
import { DevVideoCard } from './DEV.Card.Video';
import { NetbusCard } from '../NetbusCard';

import { NetworkCard } from '../NetworkCard';
import { CssValue, t, css } from './DEV.common';
import { useController } from './DEV.useController';

export type DevNetworkCardProps = {
  instance: t.InstanceId;
  network: t.PeerNetwork;
  child?: t.DevChildKind;
  style?: CssValue;
};

export const DevNetworkCard: React.FC<DevNetworkCardProps> = (props) => {
  const { network, instance, child } = props;
  const { netbus } = network;

  const ctrl = useController({ network, instance });

  /**
   * Render
   */
  const styles = {
    child: css({ flex: 1 }),
  };

  let elChild: undefined | JSX.Element;

  if (child === 'Netbus') {
    elChild = <NetbusCard netbus={netbus} style={styles.child} />;
  }
  if (child === 'Crdt') {
    elChild = <DevCrdtCard network={network} style={styles.child} />;
  }
  if (child === 'Filesystem') {
    elChild = <DevFsCard network={network} style={styles.child} />;
  }
  if (child === 'Video') {
    elChild = <DevVideoCard instance={instance} network={network} style={styles.child} />;
  }

  return (
    <NetworkCard
      style={props.style}
      instance={props.instance}
      network={network}
      child={elChild || ctrl.child}
    />
  );
};
