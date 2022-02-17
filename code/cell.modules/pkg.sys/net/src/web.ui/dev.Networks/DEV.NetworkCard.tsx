import React, { useEffect, useState } from 'react';

import { NetworkCard } from '../NetworkCard';
import { CssValue, t } from './DEV.common';
import { useController } from './DEV.useController';

export type DevNetworkCardProps = {
  instance: t.InstanceId;
  network: t.PeerNetwork;
  style?: CssValue;
};

export const DevNetworkCard: React.FC<DevNetworkCardProps> = (props) => {
  const { network, instance } = props;
  const ctrl = useController({ network, instance });

  return (
    <NetworkCard
      style={props.style}
      instance={props.instance}
      network={network}
      child={ctrl.child}
    />
  );
};
