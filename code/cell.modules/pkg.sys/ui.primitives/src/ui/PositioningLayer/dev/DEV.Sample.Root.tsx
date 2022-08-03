import React, { useState } from 'react';
import { color, css, CssValue } from '../common';

export type SampleRootProps = {
  children?: React.ReactNode;
  style?: CssValue;
};

export const SampleRoot: React.FC<SampleRootProps> = (props) => {
  const [clickCount, setClickCount] = useState<number>(0);

  const styles = {
    base: css({
      position: 'relative',
      flex: 1,
      backgroundColor: color.format(1),
    }),
    bg: css({
      Absolute: 0,
      Flex: 'center-center',
      color: color.format(-0.3),
      userSelect: 'none',
    }),
    body: css({
      Absolute: 0,
      display: 'flex',
      pointerEvents: 'none', // NB: Allow click throughs of container element.
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.bg} onClick={() => setClickCount((prev) => prev + 1)}>
        Background Clicked: {clickCount}
      </div>
      <div {...styles.body}>{props.children}</div>
    </div>
  );
};
