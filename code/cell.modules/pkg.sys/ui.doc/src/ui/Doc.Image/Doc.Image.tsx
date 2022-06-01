import React, { useEffect, useRef, useState } from 'react';
import { Color, FC, COLORS, css, CssValue, t, Photo, DEFAULT } from './common';

/**
 * Type
 */
export type DocImageProps = {
  url?: string;
  width?: number;
  borderRadius?: number;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<DocImageProps> = (props) => {
  const { width, borderRadius = DEFAULT.borderRadius } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
    }),
    image: css({ width, display: 'block' }),
  };

  /**
   * TODO 🐷
   * - Use <Photo> instead of raw <img/>.
   * - FIX: <Photo> to internally use a hidden <img/> so as to push out height of image.
   */

  return (
    <div {...css(styles.base, props.style)}>
      {props.url && <img src={props.url} {...styles.image} />}
    </div>
  );
};

/**
 * Export
 */

type Fields = {
  DEFAULT: typeof DEFAULT;
};
export const DocImage = FC.decorate<DocImageProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'DocImage' },
);
