import React from 'react';

import { color, COLORS, css, CssValue, t } from '../common';

/**
 * TODO 🐷
 * - Factor <DevEventBusCard> into root `web.ui` folder
 */

export type NetworkCardChildProps = {
  children?: React.ReactNode;
  style?: CssValue;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
};

export const NetworkCardChild: React.FC<NetworkCardChildProps> = (props) => {
  const { minWidth, maxWidth, width } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'x-stretch-stretch',
      boxSizing: 'border-box',
      width,
      minWidth,
      maxWidth,
    }),
    body: css({ flex: 1, Flex: 'y-stretch-stretch' }),
    divider: {
      base: css({ Flex: 'y-center-center', width: 30 }),
      bar: css({ width: '100%', borderTop: `solid 12px ${color.alpha(COLORS.DARK, 0.1)}` }),
    },
  };

  const elDivider = (
    <div {...styles.divider.base}>
      <div {...styles.divider.bar} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elDivider}
      <div {...styles.body}>{props.children}</div>
    </div>
  );
};
