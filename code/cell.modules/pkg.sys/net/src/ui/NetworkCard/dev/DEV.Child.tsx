import React from 'react';

import { NetbusCard } from '../../NetbusCard';
import { DevCrdtCard } from './DEV.Card.Crdt';
import { DevFsCard } from './DEV.Card.Fs';
import { DevCardPlaceholder } from './DEV.Card.Placeholder';
import { DevVideoCard } from './DEV.Card.Video';
import { css, t } from './DEV.common';

export type DevChildProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  kind?: t.DevChildKind;
};

export const DevChild: React.FC<DevChildProps> = (props) => {
  const { instance, kind } = props;

  /**
   * Render
   */
  const styles = {
    child: css({ flex: 1 }),
  };

  const defaultChild = <DevCardPlaceholder style={styles.child} />;

  if (kind === 'Placeholder') {
    return defaultChild;
  }
  if (kind === 'Netbus') {
    return <NetbusCard instance={instance} style={styles.child} />;
  }
  if (kind === 'Crdt') {
    return <DevCrdtCard instance={instance} style={styles.child} />;
  }
  if (kind === 'Filesystem') {
    return <DevFsCard instance={instance} style={styles.child} />;
  }
  if (kind === 'Video') {
    return <DevVideoCard instance={instance} style={styles.child} />;
  }

  return defaultChild;
};
