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
  instance: { network: t.PeerNetwork; id: t.Id };
  child?: t.DevChildKind;
  showPlaceholder?: boolean;
  style?: CssValue;
};

export const DevNetworkCard: React.FC<DevNetworkCardProps> = (props) => {
  const { instance, child } = props;

  /**
   * Render
   */
  const styles = {
    child: css({ flex: 1 }),
  };

  const defaultChild = <DevCardPlaceholder style={styles.child} />;
  const ctrl = useController({ instance, defaultChild });

  let elChild: undefined | JSX.Element;

  if (child === 'Placeholder' || (!ctrl.child && props.showPlaceholder)) {
    elChild = defaultChild;
  }
  if (child === 'Netbus') {
    elChild = <NetbusCard instance={instance} style={styles.child} />;
  }
  if (child === 'Crdt') {
    elChild = <DevCrdtCard instance={instance} style={styles.child} />;
  }
  if (child === 'Filesystem') {
    elChild = <DevFsCard instance={instance} style={styles.child} />;
  }
  if (child === 'Video') {
    elChild = <DevVideoCard instance={instance} style={styles.child} />;
  }

  return <NetworkCard instance={instance} child={elChild || ctrl.child} style={props.style} />;
};
