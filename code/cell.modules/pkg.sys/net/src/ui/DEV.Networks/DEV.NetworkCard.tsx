import React from 'react';

import { NetbusCard } from '../NetbusCard';
import { NetworkCard } from '../NetworkCard';
import { DevCrdtCard } from './DEV.Card.Crdt';
import { DevFsCard } from './DEV.Card.Fs';
import { DevCardPlaceholder } from './DEV.Card.Placeholder';
import { DevVideoCard } from './DEV.Card.Video';
import { css, CssValue, t } from './DEV.common';
import { useController } from './DEV.useController';

export type DevNetworkCardProps = {
  instance: t.Id;
  network: t.PeerNetwork;
  child?: t.DevChildKind;
  showPlaceholder?: boolean;
  style?: CssValue;
};

export const DevNetworkCard: React.FC<DevNetworkCardProps> = (props) => {
  const { network, instance } = props;
  const { netbus } = network;
  const child = props.child;

  /**
   * Render
   */
  const styles = {
    child: css({ flex: 1 }),
  };

  const defaultChild = <DevCardPlaceholder style={styles.child} />;
  const ctrl = useController({
    network,
    instance,
    defaultChild,
  });

  let elChild: undefined | JSX.Element;

  if (child === 'Placeholder' || (!ctrl.child && props.showPlaceholder)) {
    elChild = defaultChild;
  }
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
