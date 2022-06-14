import React, { useEffect, useRef, useState } from 'react';

import { COLORS, css, CssValue } from './common';

export type DevBackgroundProps = { style?: CssValue };

export const DevBackground: React.FC<DevBackgroundProps> = (props) => {
  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', userSelect: 'none', cursor: 'default' }),
    topLeft: {
      base: css({
        Absolute: [10, null, null, 12],
        Flex: 'y-start-start',
        fontSize: 14,
        fontWeight: 'bold',

        color: COLORS.DARK,
        opacity: isOver ? 0.6 : 0.3,
        transition: `opacity 550ms`,
      }),
      label: css({ Flex: 'x-center-center' }),
    },
  };

  const elTopLeft = (
    <div {...styles.topLeft.base} onMouseEnter={over(true)} onMouseLeave={over(false)}>
      <div {...styles.topLeft.label}>{'SELF'}</div>
      <div {...styles.topLeft.label}>{'SOVEREIGN'}</div>
      <div {...styles.topLeft.label}>{'NETWORK'}</div>
    </div>
  );

  return <div {...css(styles.base, props.style)}>{elTopLeft}</div>;
};
