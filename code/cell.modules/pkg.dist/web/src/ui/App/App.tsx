import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t, Photo, Vimeo } from '../common';

export type AppProps = {
  instance: { bus: t.EventBus; id: string };
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
    video: css({ opacity: 0 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Vimeo instance={props.instance} video={701008221} style={styles.video} />

      <Photo
        style={styles.photo}
        def={props.photos}
        index={props.index}
        defaults={{ transition: 1000 }}
      />
    </div>
  );
};
