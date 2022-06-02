import React, { useEffect, useRef, useState } from 'react';
import { Color, FC, COLORS, css, CssValue, t, Photo, DEFAULT } from './common';

/**
 * Type
 */
export type DocImageProps = {
  url?: string;
  width?: number;
  borderRadius?: number;
  credit?: React.ReactNode;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<DocImageProps> = (props) => {
  const { url, width, borderRadius = DEFAULT.borderRadius, credit } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      color: COLORS.DARK,
    }),
    body: css({
      overflow: 'hidden',
      borderRadius,
    }),
    image: css({ width, display: 'block' }),
    credit: css({
      marginTop: 3,
      fontSize: 11,
      textAlign: 'right',
      opacity: 0.3,
    }),
  };

  /**
   * TODO 🐷
   * - Use <Photo> instead of raw <img/>.
   * - FIX: <Photo> to internally use a hidden <img/> so as to push out height of image.
   */

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>{url && <img src={url} {...styles.image} />}</div>
      {credit && <div {...styles.credit}>{credit}</div>}
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
