import React from 'react';

import { CommandBar } from '../../Command.Bar';
import { color, CssValue, LocalPeerCard, t, COLORS } from '../common';

export type NetworkCardFooterProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const NetworkCardFooter: React.FC<NetworkCardFooterProps> = (props) => {
  const { network } = props;
  const { bus, netbus } = network;
  const self = netbus.self;

  /**
   * Initiate a new connection.
   */
  const startConnection = (command: string) => {
    const isReliable = true;
    const autoStartVideo = true;
    const remote = command;
    return LocalPeerCard.connect({ bus, remote, self, isReliable, autoStartVideo });
  };

  return (
    <CommandBar
      network={network}
      onAction={(e) => startConnection(e.text)}
      backgroundColor={color.alpha(COLORS.DARK, 0.85)}
      cornerRadius={[0, 0, 3, 3]}
      inset={true}
    />
  );
};
