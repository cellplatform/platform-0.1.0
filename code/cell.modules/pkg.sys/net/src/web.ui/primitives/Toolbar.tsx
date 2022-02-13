import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Style } from '../../common';

export type ToolbarProps = {
  children?: React.ReactNode;
  edge?: 'N' | 'S';
  padding?: t.CssEdgesInput;
  style?: CssValue;
};

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { edge = 'N', padding = [8, 12] } = props;
  const border = `solid 1px ${color.format(-0.08)}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      Flex: `x-spaceBetween-center`,
      borderTop: edge === 'S' ? border : undefined,
      borderBottom: edge === 'N' ? border : undefined,
      backgroundColor: color.format(-0.03),
      color: color.format(-0.6),
      borderRadius: edge === 'N' ? [2, 2, 0, 0] : [0, 0, 2, 2],
      ...Style.toPadding(padding),
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.children}</div>;
};
