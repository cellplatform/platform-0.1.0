import React, { useState } from 'react';
import { Button, Color, COLORS, css, CssValue, Icons } from './common';

export type DevButtonFullscreenProps = {
  isFullscreen: boolean;
  style?: CssValue;
  onClick?: () => void;
};

export const DevButtonFullscreen: React.FC<DevButtonFullscreenProps> = (props) => {
  const { isFullscreen } = props;

  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  const Icon = isFullscreen ? Icons.FullScreen.Exit : Icons.FullScreen.Open;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      pointerEvents: 'auto',
      Margin: [2, 4, null, null],
      opacity: isOver ? 1 : 0.6,
      transition: `opacity 100ms`,
    }),
  };

  return (
    <div {...css(styles.base, props.style)} onMouseEnter={over(true)} onMouseLeave={over(false)}>
      <Button style={styles.base} onClick={props.onClick}>
        <Icon color={Color.alpha(COLORS.DARK, 0.7)} size={26} />
      </Button>
    </div>
  );
};
