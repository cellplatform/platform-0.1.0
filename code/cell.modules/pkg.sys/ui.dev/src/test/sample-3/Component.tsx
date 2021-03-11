import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type ComponentProps = { style?: CssValue };

export const Component: React.FC<ComponentProps> = (props) => {
  const styles = {
    base: css({
      padding: 50,
      color: color.format(1),
    }),
  };
  return <div {...css(styles.base, props.style)}>Sample-3</div>;
};
