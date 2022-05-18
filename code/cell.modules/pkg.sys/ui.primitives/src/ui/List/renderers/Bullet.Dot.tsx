import React from 'react';

import { Bullet } from '../../Bullet';
import { css, CssValue, t } from '../common';

export type BulletDotProps = t.ListItemRendererArgs & { item?: t.BulletProps; style?: CssValue };

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
