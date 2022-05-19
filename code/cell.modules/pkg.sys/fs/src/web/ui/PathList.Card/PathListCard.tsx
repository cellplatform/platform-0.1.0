import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from './common';

export type PathListCardProps = { style?: CssValue };

export const PathListCard: React.FC<PathListCardProps> = (props) => {
  /**
   * [Render]
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>PathListCard</div>;
};
