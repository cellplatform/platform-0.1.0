import React, { useEffect, useRef, useState } from 'react';
import { FC, color, COLORS, css, CssValue, t } from '../../common';
import { PhotoImage } from './Photo.Image';
import { DEFAULT } from './common';
import { PhotoProps } from './types';
import { Util } from './Util';
import { DefsSelector } from './ui/Debug.DefsSelector';

export { PhotoProps };

const View: React.FC<PhotoProps> = (props) => {
  const { index = DEFAULT.index } = props;
  const defs = Util.toDefs(props.def);

  /**
   * TODO 🐷
   * - def as simple "string" (url)
   * - index selection of set (`currentIndex: number`)
   *    - transition controls between images - recursive call to self as "[def]" (single item index)
   */

  const images = defs.map((def, i) => {
    const isCurrent = i === index;
    return <PhotoImage key={i} def={def} opacity={isCurrent ? 1 : 0} />;
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
 * Export
 */
type Fields = {
  default: typeof DEFAULT;
  toDefs: typeof Util.toDefs;
  Debug: { DefsSelector: typeof DefsSelector };
};
export const Photo = FC.decorate<PhotoProps, Fields>(
  View,
  {
    default: DEFAULT,
    toDefs: Util.toDefs,
    Debug: { DefsSelector },
  },
  { displayName: 'Photo' },
);
