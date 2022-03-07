import React from 'react';

import { Bullet, BulletProps } from '../../Bullet';
import { css, CssValue, k } from '../common';

export type BulletDotProps = k.ListBulletRendererArgs & { item?: BulletProps; style?: CssValue };

export const BulletDot: React.FC<BulletDotProps> = (props) => {
  if (props.kind === 'Spacing') return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({ flex: 1, Flex: 'center-center', position: 'relative' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Bullet {...props.item} />
    </div>
  );
};
