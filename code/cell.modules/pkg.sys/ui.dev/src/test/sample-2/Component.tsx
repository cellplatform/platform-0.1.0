import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue } from '../../common';

export type ComponentProps = { count: number; style?: CssValue };

export const Component: React.FC<ComponentProps> = (props) => {
  const styles = {
    base: css({
      padding: 20,
    }),
  };
  return <div {...css(styles.base, props.style)}>Component ({props.count})</div>;
};
