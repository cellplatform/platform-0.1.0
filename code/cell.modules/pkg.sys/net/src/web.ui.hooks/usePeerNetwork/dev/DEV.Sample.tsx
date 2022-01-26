import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Card } from './DEV.common';
import { DevSampleNetwork } from './DEV.Sample.Network';

export type DevSampleProps = {
  networks: t.DevNetwork[];

  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { networks = [] } = props;
  const isEmpty = networks.length === 0;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      minWidth: 450,
    }),
    empty: css({
      padding: 50,
      Flex: 'center-center',
      fontSize: 12,
      fontStyle: 'italic',
      opacity: 0.3,
    }),
  };

  const elEmpty = isEmpty && <div {...styles.empty}>No networks to display</div>;

  const elList =
    !isEmpty &&
    networks.map((network, i) => {
      return <DevSampleNetwork key={i} network={network} />;
    });

  return (
    <div {...css(styles.base, props.style)}>
      {elEmpty}
      {elList}
    </div>
  );
};
