import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from './common';

export type RowanProps = { style?: CssValue };

export const Rowan: React.FC<RowanProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...css(styles.base, props.style)}>Rowan</div>;
};
