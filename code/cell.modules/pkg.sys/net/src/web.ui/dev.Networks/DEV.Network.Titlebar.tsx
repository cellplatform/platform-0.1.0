import React from 'react';

import { color, css, CssValue, Icons, t } from './DEV.common';
import { Toolbar } from '../primitives';

export type DevNetworkTitlebarProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  style?: CssValue;
};

export const DevNetworkTitlebar: React.FC<DevNetworkTitlebarProps> = (props) => {
  const iconSize = 20;

  const DISABLED = 0.1;
  const ENABLED = 1;

  /**
   * [Render]
   */
  const styles = {
    base: css({ paddingLeft: 10 }),
    title: css({}),
    icons: css({ Flex: 'x-center-center', marginRight: 10 }),
    icon: css({
      position: 'relative',
      top: 0,
      marginRight: 10,
      ':last-child': { marginRight: 0 },
    }),
  };

  return (
    <Toolbar style={css(styles.base, props.style)} edge={'N'}>
      <div {...css(styles.title)}>{'Network Peer'}</div>
      <div {...styles.icons}>
        <Icons.FsNetworkDrive style={styles.icon} size={iconSize} opacity={DISABLED} />
        <Icons.Bus style={styles.icon} size={iconSize} opacity={ENABLED} />
      </div>
    </Toolbar>
  );
};
