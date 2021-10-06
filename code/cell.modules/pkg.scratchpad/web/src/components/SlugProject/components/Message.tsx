import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';

export type MessageProps = {
  children?: React.ReactNode;
  style?: CssValue;
};

export const Message: React.FC<MessageProps> = (props) => {
  const styles = {
    base: css({
      flex: 1,
      Flex: 'center-center',
      backdropFilter: `blur(5px)`,
    }),
    inner: css({
      padding: 40,
      border: `dashed 2px ${color.format(-0.2)}`,
      borderRadius: 20,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.inner}>{props.children}</div>
    </div>
  );
};
