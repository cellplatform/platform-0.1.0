import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx } from './common';

export type DevFilesystemProps = { style?: CssValue };

export const DevFilesystem: React.FC<DevFilesystemProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */ }),
  };
  return <div {...css(styles.base, props.style)}>DevFilesystem 🐷</div>;
};
