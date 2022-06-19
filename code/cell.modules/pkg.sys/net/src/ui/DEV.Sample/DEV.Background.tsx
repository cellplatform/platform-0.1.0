import React from 'react';

import { css, CssValue, t } from './common';
import { DevFs } from './DEV.Background.FS';
import { DevLogo } from './DEV.Background.Logo';

export type DevBackgroundProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  style?: CssValue;
};

export const DevBackground: React.FC<DevBackgroundProps> = (props) => {
  const { instance } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', userSelect: 'none', cursor: 'default' }),
    layout: {
      topLeft: css({ Absolute: [10, null, null, 12] }),
      bottomLeft: css({ Absolute: [null, null, 6, 10] }),
    },
  };

  const elTopLeft = (
    <div {...styles.layout.topLeft}>
      <DevLogo instance={instance} />
    </div>
  );

  const elBottomLeft = (
    <div {...styles.layout.bottomLeft}>
      <DevFs instance={instance} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elTopLeft}
      {elBottomLeft}
    </div>
  );
};
