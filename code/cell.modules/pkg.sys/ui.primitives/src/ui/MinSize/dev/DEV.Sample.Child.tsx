import { DevActions, lorem } from 'sys.ui.dev';
import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';
import { MinSize } from '..';

export type SampleChildProps = {
  minWidth?: number;
  minHeight?: number;
  style?: CssValue;
};

export const SampleChild: React.FC<SampleChildProps> = (props) => {
  const { minWidth, minHeight } = props;

  const styles = {
    base: css({ padding: 20, overflow: 'hidden' }),
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
