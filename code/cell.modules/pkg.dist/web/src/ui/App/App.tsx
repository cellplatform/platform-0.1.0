import React from 'react';
import { css, CssValue, Fullscreen, Photo, t, Vimeo } from '../common';

export type AppProps = {
  instance: { bus: t.EventBus; id: string };
  index?: number;
  photos?: t.Photo[];
  run?: boolean;
  style?: CssValue;
};

export const App: React.FC<AppProps> = (props) => {
  const { instance } = props;
  const fullscreen = Fullscreen.useFullscreen({ instance });

  const timer = Photo.useIndexSequence({
    def: props.photos,
    index: props.index,
    enabled: props.run,
    defaultDuration: 5000,
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    photo: css({ Absolute: 0 }),
    video: css({ opacity: 0 }),
  };

  return (
    <div {...css(styles.base, props.style)} ref={fullscreen.ref}>
      <Vimeo instance={props.instance} video={701008221} style={styles.video} />

      <Photo
        style={styles.photo}
        def={props.photos}
        index={timer.index}
        defaults={{
          transition: 2500,
          // duration: 8000,
        }}
      />
    </div>
  );
};
