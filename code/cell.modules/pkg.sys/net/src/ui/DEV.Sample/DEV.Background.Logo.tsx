import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx } from '../common';

export type DevLogoProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  style?: CssValue;
};

export const DevLogo: React.FC<DevLogoProps> = (props) => {
  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      fontSize: 14,
      fontWeight: 'bold',
      color: COLORS.DARK,
      opacity: isOver ? 1 : 0.3,
      transition: `opacity 300ms`,
      userSelect: 'none',
      Flex: 'y-start-start',
    }),
    label: css({ Flex: 'x-center-center' }),
  };

  return (
    <div {...css(styles.base, props.style)} onMouseEnter={over(true)} onMouseLeave={over(false)}>
      {/* <div {...styles.label}>{'SELF'}</div>
      <div {...styles.label}>{'SOVEREIGN'}</div> */}
      <div {...styles.label}>{'SYSTEM CELL'}</div>
      {/* <div {...styles.label}>{'SYS RUNTIME'}</div> */}
    </div>
  );
};
