import * as React from 'react';
import { t, css, GlamorValue } from '../../common';

/**
 * Renders an curried image.
 */
export type IImageProps = {
  style?: GlamorValue;
  opacity?: number;
  scale?: number;
  origin?: string;
};

/**
 * Curry an image src into a JSX element.
 */
export const image = (src: t.ImageSrc) => {
  const { x1, x2, width, height } = src;
  const imageCss = css({ Image: [x1, x2, width, height] });
  return (props: IImageProps) => {
    const styles = {
      base: css({
        opacity: props.opacity,
        transform: typeof props.scale === 'number' ? `scale(${props.scale})` : undefined,
        transformOrigin: props.origin,
      }),
    };
    return <div {...css(imageCss, styles.base, props.style)} />;
  };
};
