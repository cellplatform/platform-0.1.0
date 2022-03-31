import React from 'react';

import { color, COLORS, CssValue, k, rx, t, CmdBar } from '../common';

export type NetworkCardFooterProps = {
  instance: t.Id;
  network: t.PeerNetwork;
  style?: CssValue;
};

export const NetworkCardFooter: React.FC<NetworkCardFooterProps> = (props) => {
  const { network, instance } = props;
  const bus = rx.busAsType<k.NetworkCardEvent>(network.bus);

  return (
    <CmdBar
      instance={{ bus, id: instance }}
      backgroundColor={color.alpha(COLORS.DARK, 0.85)}
      cornerRadius={[0, 0, 3, 3]}
    />
  );
};
