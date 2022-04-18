import React, { useEffect, useRef, useState } from 'react';
import { FC, color, COLORS, css, CssValue, t } from '../../common';
import { PhotoImg } from './Photo.Img';
import { DEFAULTS } from './common';

export type PhotoProps = {
  def?: t.Photo | t.Photo[];
  style?: CssValue;
};

const View: React.FC<PhotoProps> = (props) => {
  // const inputDef = props.def ?? [];
  // const defs = Array.isArray(inputDef) ? inputDef : inputDef === undefined ? [] : [inputDef];
  const defs = Util.toDefs(props.def);

  /**
   * TODO 🐷
   * - def as simple "string" (url)
   * - index selection of set (`currentIndex: number`)
   *    - transition controls between images - recursive call to self as "[def]" (single item index)
   */

  const images = defs.map((def, i) => {
    return <PhotoImg key={i} def={def} />;
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
    }),
  };
  return <div {...css(styles.base, props.style)}>{images}</div>;
};

/**
 * Helpers
 */
const Util = {
  toDefs(inputDef: PhotoProps['def'] = []) {
    const defs = Array.isArray(inputDef) ? inputDef : inputDef === undefined ? [] : [inputDef];
    return defs;
  },
};

/**
 * Export
 */
type Fields = {
  defaults: typeof DEFAULTS;
  toDefs: typeof Util.toDefs;
};
export const Photo = FC.decorate<PhotoProps, Fields>(
  View,
  { defaults: DEFAULTS, toDefs: Util.toDefs },
  { displayName: 'Photo' },
);
