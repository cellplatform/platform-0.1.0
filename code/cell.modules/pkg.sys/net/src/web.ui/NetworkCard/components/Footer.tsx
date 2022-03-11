import React from 'react';

import { color, COLORS, CssValue, k, rx, t, CommandBar } from '../common';

export type NetworkCardFooterProps = {
  instance: t.InstanceId;
  network: t.PeerNetwork;
  style?: CssValue;
};

export const NetworkCardFooter: React.FC<NetworkCardFooterProps> = (props) => {
  const { network, instance } = props;
  const bus = rx.busAsType<k.NetworkCardEvent>(network.bus);

  return (
    <CommandBar
      events={{ bus, instance }}
      bus={network.netbus}
      backgroundColor={color.alpha(COLORS.DARK, 0.85)}
      cornerRadius={[0, 0, 3, 3]}
      inset={true}
    />
  );
};
