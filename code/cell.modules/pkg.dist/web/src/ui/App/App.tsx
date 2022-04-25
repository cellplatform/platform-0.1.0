import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t, Photo } from '../common';

export type AppProps = {
  index?: number;
  photos?: t.Photo[];
  style?: CssValue;
};

export const App: React.FC<AppProps> = (props) => {
  // const def: t.Photo[] = [
  //   { url: '/static/images/paul/g-street-bob-kath-gay.png' },
  //   { url: '/static/images/paul/head-shot.png' },
  //   { url: '/static/images/paul/paul-randel.png' },
  // ];

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    photo: css({ Absolute: 0 }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <Photo style={styles.photo} def={props.photos} index={props.index} />
    </div>
  );
};
