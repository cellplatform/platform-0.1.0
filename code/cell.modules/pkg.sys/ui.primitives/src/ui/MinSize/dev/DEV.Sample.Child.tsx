import React, { useEffect, useRef, useState } from 'react';
import { lorem } from 'sys.ui.dev';

import { css, CssValue } from '../common';

export type SampleChildProps = {
  minWidth?: number;
  minHeight?: number;
  style?: CssValue;
};

export const SampleChild: React.FC<SampleChildProps> = (props) => {
  const { minWidth, minHeight } = props;

  const styles = {
    base: css({ Padding: [20, 30], overflow: 'hidden' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <p>
        minimum size: {minWidth ?? '-'} x {minHeight ?? '-'}
      </p>
      <p>{lorem.text}</p>
      <p>{lorem.text}</p>
    </div>
  );
};
