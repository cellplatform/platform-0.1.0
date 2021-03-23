import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, drag, useResizeObserver } from '../../common';
import { useThumbDragController } from './useThumbDragController';
import { SliderOrientation } from './types';
import { DefaultTrack } from './Slider.DefaultTrack';

export type SliderProps = {
  orientation?: SliderOrientation;
  style?: CssValue;
  thumb?: JSX.Element;
  track?: JSX.Element;
};

export const Slider: React.FC<SliderProps> = (props) => {
  const { orientation = 'x' } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const resize = useResizeObserver(rootRef);
  const thumb = useThumbDragController({ thumbRef, size: resize.rect.width });

  const styles = {
    base: css({
      position: 'relative',
      userSelect: 'none',
    }),

    container: css({
      Absolute: 0,
    }),
  };

  return (
    <div {...css(styles.base, props.style)} ref={rootRef}>
      <div ref={trackRef} {...styles.container}>
        {props.track || <DefaultTrack orientation={orientation} />}
      </div>
      <div ref={thumbRef} {...styles.container}>
        {props.thumb}
      </div>
    </div>
  );
};
