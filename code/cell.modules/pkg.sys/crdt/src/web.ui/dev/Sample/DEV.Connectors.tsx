import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, COLORS } from '../../common';

export type ConnectorsProps = {
  total?: number;
  rounded?: number;
  border?: number;
  style?: CssValue;
};

export const Connectors: React.FC<ConnectorsProps> = (props) => {
  const borderWidth = Math.max(1, props.border ?? 1);
  const border = `solid ${borderWidth}px ${COLORS.DARK}`;
  const total = props.total ?? 2;
  const totalArms = total - 2;

  const styles = {
    base: css({
      position: 'relative',
      Flex: 'horizontal-stretch-spaceBetween',
      border,
      borderTop: 'none',
      borderRadius: `0 0 ${props.rounded}px ${props.rounded}px`,
      height: 60,
      opacity: 0.4,
    }),
    arm: css({ borderLeft: border }),
  };

  const elArms = Array.from({ length: totalArms }).map((v, i) => {
    return <div key={i} {...styles.arm} />;
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div />
      {elArms}
      <div />
    </div>
  );
};
