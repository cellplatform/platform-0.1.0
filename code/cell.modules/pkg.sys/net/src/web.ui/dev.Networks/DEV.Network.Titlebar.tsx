import React from 'react';

import { color, css, CssValue, Icons, t } from './DEV.common';

export type DevSampleNetworkTitlebarProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  style?: CssValue;
};

export const DevSampleNetworkTitlebar: React.FC<DevSampleNetworkTitlebarProps> = (props) => {
  const iconSize = 20;

  const DISABLED = 0.4;
  const ENABLED = 1;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      Flex: `x-spaceBetween-center`,
      PaddingY: 8,
      borderBottom: `solid 1px ${color.format(-0.08)}`,
      backgroundColor: color.format(-0.03),
    }),
    title: css({ marginLeft: 15, color: color.format(-0.6) }),
    icons: css({ Flex: 'x-center-center', marginRight: 10 }),
    icon: css({
      position: 'relative',
      top: 0,
      marginRight: 10,
      ':last-child': { marginRight: 0 },
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...css(styles.title)}>
        <span>{'Network Peer'}</span>
      </div>

      <div {...styles.icons}>
        <Icons.Database style={styles.icon} size={iconSize} opacity={DISABLED} />
        <Icons.Bus style={styles.icon} size={iconSize} opacity={DISABLED} />
      </div>
    </div>
  );
};
