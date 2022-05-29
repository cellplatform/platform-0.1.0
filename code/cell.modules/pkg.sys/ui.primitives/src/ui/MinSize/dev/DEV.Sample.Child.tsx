import React from 'react';
import { lorem } from 'sys.ui.dev';

import { css, t, CssValue } from '../common';

export type SampleChildProps = {
  size?: t.DomRect;
  minWidth?: number;
  minHeight?: number;
  style?: CssValue;
};

export const SampleChild: React.FC<SampleChildProps> = (props) => {
  const { size, minWidth, minHeight } = props;

  const styles = {
    base: css({ Padding: [20, 30], overflow: 'hidden' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <p>
        size: {size?.width ?? '-'} x {size?.height ?? '-'}
      </p>
      <p>
        minimum size: {minWidth ?? '-'} x {minHeight ?? '-'}
      </p>
      <p>{lorem.text}</p>
      <p>{lorem.text}</p>
    </div>
  );
};
