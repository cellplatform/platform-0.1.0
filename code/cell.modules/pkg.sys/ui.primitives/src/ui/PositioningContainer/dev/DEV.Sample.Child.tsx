import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';

export type SampleChildProps = {
  width?: number;
  height?: number;
  style?: CssValue;
};

export const SampleChild: React.FC<SampleChildProps> = (props) => {
  const { width, height } = props;

  const styles = {
    base: css({
      userSelect: 'none',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      display: 'inline-block',
      position: 'relative',
      borderRadius: 15,
      border: `dashed 1px ${color.format(-0.1)}`,
      boxSizing: 'border-box',
      padding: 20,
      flex: 1,
      minWidth: 100,
      minHeight: 60,
      width,
      height,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div />
    </div>
  );
};
