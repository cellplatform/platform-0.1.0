import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, Text } from '../common';

export type DevUrlTextProps = {
  href?: string;
  fontSize?: number;
  style?: CssValue;
};

export const DevUrlText: React.FC<DevUrlTextProps> = (props) => {
  const { fontSize = 16 } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      fontSize,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Text.Syntax text={props.href} />
    </div>
  );
};
