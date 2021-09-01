import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { SliderOrientation } from './types';

export type DefaultTrackProps = {
  orientation: SliderOrientation;
  style?: CssValue;
};

export const DefaultTrack: React.FC<DefaultTrackProps> = (props) => {
  const { orientation } = props;
  const is = {
    x: orientation === 'x',
    y: orientation === 'y',
  };

  const styles = {
    base: css({
      Absolute: 0,
      Flex: is.x ? 'horizontal-center-stretch' : 'vertical-stretch-center',
    }),
    track: css({
      flex: 1,
      height: is.x ? 2 : undefined,
      width: is.y ? 2 : undefined,
      borderRadius: 5,
      border: `solid 1px ${color.format(-0.2)}`,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.track} />
    </div>
  );
};
