import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, Icons } from '../common';

export type DevFsProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  style?: CssValue;
};

export const DevFs: React.FC<DevFsProps> = (props) => {
  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      opacity: isOver ? 1 : 0.3,
      transition: `opacity 300ms`,
    }),
  };

  return (
    <div
      {...css(styles.base, props.style)}
      onClick={() => {
        console.log('TODO', 'FileSystem Info');
      }}
      onMouseEnter={over(true)}
      onMouseLeave={over(false)}
    >
      <Icons.Fs.Drive color={COLORS.DARK} size={32} />
    </div>
  );
};
