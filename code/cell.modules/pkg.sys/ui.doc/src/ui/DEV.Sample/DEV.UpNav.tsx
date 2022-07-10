import React from 'react';

import { Icons } from '../Icons';
import { Button, COLORS, css, CssValue } from './common';

export type UpNavProps = {
  style?: CssValue;
  onClick?: () => void;
};

export const UpNav: React.FC<UpNavProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ pointerEvents: 'none' }),
    button: css({
      Absolute: [10, null, null, 10],
      pointerEvents: 'auto',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <Button onClick={props.onClick} style={styles.button}>
        <Icons.Arrow.Up color={COLORS.DARK} />
      </Button>
    </div>
  );
};
