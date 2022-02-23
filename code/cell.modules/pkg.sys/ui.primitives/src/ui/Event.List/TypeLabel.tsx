import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type TypeLabelProps = {
  text: string;
  style?: CssValue;
  color?: string | number;
};

export const TypeLabel: React.FC<TypeLabelProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      fontSize: 12,
      fontFamily: 'monospace',
      color: props.color,
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.text}</div>;
};
