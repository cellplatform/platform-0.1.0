import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t } from '../common';

export type VercelHttpProps = { style?: CssValue };

export const VercelHttp: React.FC<VercelHttpProps> = (props) => {
  /**
   * [Render]
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>VercelHttp</div>;
};
