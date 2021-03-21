import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, drag, useResizeObserver } from '../../common';
import { useThumbDragController } from './useThumbDragController';

export type SliderProps = {
  orientation?: 'x' | 'y';
  size?: number;
  style?: CssValue;
  thumb?: JSX.Element;
};

export const Slider: React.FC<SliderProps> = (props) => {
  const { size = 30, orientation = 'x' } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);
  const thumb = useThumbDragController({ thumbRef, size: resize.rect.width });

  // resize.rect.width
  const width = resize.rect.width;

  // const [thumbX, ] = useState<number>()

  // const thumbX = thumb.x

  const styles = {
    base: css({
      position: 'relative',
      height: size,
      flex: 1,
    }),

    track: {
      base: css({
        Absolute: 0,
        Flex: 'center-stretch',
      }),
      body: css({
        borderRadius: 5,
        height: 2,
        flex: 1,
        border: `solid 1px ${color.format(-0.2)}`,
      }),
    },
  };

  const elTrack = (
    <div {...styles.track.base}>
      <div {...styles.track.body} />
    </div>
  );

  // const elThumb = <div {...styles.thumb} ref={thumbRef}></div>;

  return (
    <div {...css(styles.base, props.style)} ref={rootRef}>
      {elTrack}
      {props.thumb}
    </div>
  );
};
