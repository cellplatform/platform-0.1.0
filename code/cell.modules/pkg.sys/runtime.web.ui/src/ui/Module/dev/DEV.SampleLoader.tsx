import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx } from '../../common';

export type DevSampleLoaderProps = { style?: CssValue };

export const DevSampleLoader: React.FC<DevSampleLoaderProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      Flex: 'center-center',
      color: COLORS.DARK,
      fontSize: 36,
    }),
  };
  return <div {...css(styles.base, props.style)}>🐷 Sample Loader...</div>;
};
