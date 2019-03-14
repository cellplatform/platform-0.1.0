import { clamp } from 'ramda';
import * as React from 'react';
import { css, GlamorValue } from '../../common';

const MEDIA_QUERY_RETINA = `@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)`;

export interface IImageSpriteProps {
  src: string;
  width: number;
  height: number;
  total: { x: number; y: number };
  x?: number;
  y?: number;
  tooltip?: string;
  style?: GlamorValue;
}

/**
 * A collection of images combined into one.
 */
export class ImageSprite extends React.PureComponent<IImageSpriteProps, {}> {
  private paths = toPaths(this.props.src);

  private get position() {
    const { width, height, total } = this.props;
    let { x = 1, y = 1 } = this.props;
    x = clamp(1, total.x, x) - 1;
    y = clamp(1, total.y, y) - 1;

    x = 0 - x * width;
    y = 0 - y * height;
    return `${x}px ${y}px`;
  }

  private get image() {
    const { width, height, total } = this.props;
    const { image1x, image2x } = this.paths;
    const result = image(image1x, image2x, width, height, total);
    return {
      ...result,
      backgroundPosition: this.position,
    };
  }

  public render() {
    const { width, height, tooltip } = this.props;
    const styles = {
      base: css({
        display: 'inline-block',
        width,
        height,
        ...this.image,
      }),
    };
    return <div {...css(styles.base, this.props.style)} title={tooltip} />;
  }
}

/**
 * INTERNAL
 */
function toPaths(src: string) {
  const index = src.lastIndexOf('.');
  const base = src.substr(0, index);
  const ext = src.substr(index + 1);
  return {
    image1x: src,
    image2x: `${base}@2x.${ext}`,
  };
}

export const image = (
  image1x: string | undefined,
  image2x: string | undefined,
  width: number,
  height: number,
  total: IImageSpriteProps['total'],
) => {
  // Prepare image based on current screen density.
  if (!image1x) {
    throw new Error('Must have at least a 1x image.');
  }
  const result = {
    width,
    height,
    backgroundImage: `url(${image1x})`,
    backgroundSize: `${width * total.x}px ${height * total.y}px`,
    backgroundRepeat: 'no-repeat',
  };

  if (image2x) {
    result[MEDIA_QUERY_RETINA] = {
      backgroundImage: `url(${image2x})`,
    };
  }

  // Finish up.
  return result;
};
