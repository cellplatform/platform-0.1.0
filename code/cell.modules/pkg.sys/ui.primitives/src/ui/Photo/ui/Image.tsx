import React, { useState } from 'react';
import { Color, css, CssValue, t, DEFAULT, R } from '../common';

export type ImageProps = {
  index: number;
  def: t.Photo;
  opacity?: number;
  defaults?: Partial<t.PhotoDefaults>;
  style?: CssValue;
  onLoaded?: t.PhotoLoadedEventHandler;
};

export const Image: React.FC<ImageProps> = (props) => {
  const { index, def } = props;
  const url = def.url;
  const defaults = R.mergeDeepRight(DEFAULT.meta, props.defaults ?? {}) as t.PhotoDefaults;
  const transition = def.transition ?? defaults.transition;

  const [error, setError] = useState<string | undefined>();

  /**
   * [Handlers]
   */
  const onLoaded = (error?: string) => {
    setError(error);
    props.onLoaded?.({ index, def, error });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      opacity: error ? 0 : props.opacity,
      transition: `opacity ${transition}ms`,
      Flex: 'center-center',
    }),

    url: {
      base: css({ Absolute: [null, 10, 10, null] }),
      a: css({
        fontSize: 12,
        color: Color.format(1),
        textShadow: `0px 1px 4px ${Color.format(-0.3)}`,
      }),
    },
    img: css({ Absolute: 0, objectFit: 'cover' }),
  };

  const elUrl = defaults.showUrl && (
    <div {...styles.url.base}>
      <a {...styles.url.a} href={url}>
        {url}
      </a>
    </div>
  );

  const elImage = (
    <img
      {...styles.img}
      src={url}
      width={'100%'}
      height={'100%'}
      onLoad={(e) => onLoaded()}
      onError={(e) => onLoaded('Failed to load')}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elImage}
      {elUrl}
    </div>
  );
};
