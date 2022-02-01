import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, k } from '../common';

export type BulletDotProps = k.BulletProps & { style?: CssValue };

export const BulletDot: React.FC<BulletDotProps> = (props) => {
  const styles = {
    base: css({
      position: 'relative',
      paddingRight: 8,
      Flex: 'center-center',
    }),
    dot: css({
      Size: 15,
      borderRadius: '100%',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.dot} />
    </div>
  );
};
