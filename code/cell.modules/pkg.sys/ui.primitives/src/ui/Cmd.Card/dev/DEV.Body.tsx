import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type DevBodyProps = { style?: CssValue };

export const DevBody: React.FC<DevBodyProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      flex: 1,
    }),
  };
  return <div {...css(styles.base, props.style)}>Body</div>;
};
