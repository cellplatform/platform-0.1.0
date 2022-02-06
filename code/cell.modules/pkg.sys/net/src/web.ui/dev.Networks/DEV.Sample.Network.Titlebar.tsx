import React, { useEffect, useRef, useState } from 'react';

import { color, css, CssValue, Icons, COLORS } from './DEV.common';

export type DevSampleNetworkTitlebarProps = { style?: CssValue };

export const DevSampleNetworkTitlebar: React.FC<DevSampleNetworkTitlebarProps> = (props) => {
  const iconSize = 20;
  const iconOpacity = (enabled: boolean) => (enabled ? 1 : 0.3);

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
    title: css({
      marginLeft: 15,
      color: color.format(-0.6),
    }),
    icons: css({
      Flex: 'x-center-center',
      marginRight: 10,
    }),
    icon: css({
      position: 'relative',
      top: 0,
      marginRight: 15,
      ':last-child': { marginRight: 0 },
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...css(styles.title)}>
        <span>{'Network Interface (Client)'}</span>
      </div>

      <div {...styles.icons}>
        <Icons.Filesystem style={styles.icon} size={iconSize} opacity={iconOpacity(false)} />
        <Icons.Antenna style={styles.icon} size={iconSize} opacity={iconOpacity(true)} />
        <Icons.Bus style={styles.icon} size={iconSize} opacity={iconOpacity(false)} />
      </div>
    </div>
  );
};
