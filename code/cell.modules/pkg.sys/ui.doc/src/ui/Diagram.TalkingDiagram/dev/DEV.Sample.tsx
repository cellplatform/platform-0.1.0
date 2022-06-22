import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx } from '../../common';

export type DevSampleProps = { style?: CssValue };

export const DevSample: React.FC<DevSampleProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...css(styles.base, props.style)}>DevSample: Talking Diagram</div>;
};
