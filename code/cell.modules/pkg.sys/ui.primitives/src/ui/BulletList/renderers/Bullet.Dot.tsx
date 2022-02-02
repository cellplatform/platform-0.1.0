import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, k } from '../common';

export type BulletDotProps = k.BulletItemProps & { style?: CssValue };

export const BulletDot: React.FC<BulletDotProps> = (props) => {
  const styles = {
    base: css({
      flex: 1,
      Flex: 'center-center',
      position: 'relative',
    }),
    dot: css({
      Size: 15,
      borderRadius: '100%',
      border: `solid 1px ${color.format(-0.1)}`,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.dot} />
    </div>
  );
};
