import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue } from '../../common';

export type SampleThumbProps = {
  x?: number;
  style?: CssValue;
};

export const SampleThumb: React.FC<SampleThumbProps> = (props) => {
  const size = 30;
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      Absolute: [0, null, null, props.x || 0],
      width: size,
      height: size,
    }),
  };
  return <div {...css(styles.base, props.style)}></div>;
};
