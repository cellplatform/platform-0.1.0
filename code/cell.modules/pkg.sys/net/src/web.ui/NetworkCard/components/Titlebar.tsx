import React from 'react';

import { css, CssValue, Icons, t } from '../common';

export type NetworkCardTitlebarProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  style?: CssValue;
};

export const NetworkCardTitlebar: React.FC<NetworkCardTitlebarProps> = (props) => {
  const iconSize = 20;

  const DISABLED = 0.1;
  const ENABLED = 1;

  /**
   * [Render]
   */
  const styles = {
    title: css({ paddingLeft: 5 }),
    icons: css({ Flex: 'x-center-center', marginRight: 5 }),
    icon: css({
      position: 'relative',
      top: 0,
      marginRight: 10,
      ':last-child': { marginRight: 0 },
    }),
  };

  return (
    <>
      <div {...css(styles.title)}>{'Network Peer'}</div>
      <div {...styles.icons}>
        <Icons.FsNetworkDrive style={styles.icon} size={iconSize} opacity={DISABLED} />
        <Icons.Bus style={styles.icon} size={iconSize} opacity={ENABLED} />
      </div>
    </>
  );
};