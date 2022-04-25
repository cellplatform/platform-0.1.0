import React from 'react';
import { Color, css, CssValue, t } from './common';

export type PhotoImageProps = {
  def: t.Photo;
  opacity?: number;
  style?: CssValue;
};

export const PhotoImage: React.FC<PhotoImageProps> = (props) => {
  const { def, opacity = 1 } = props;
  const url = def.url;

  /**
   * Handlers
   */

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      opacity,
      transition: `opacity 500ms`,
      Flex: 'center-center',
    }),
    url: css({
      Absolute: [null, 10, 10, null],
    }),
    a: css({
      fontSize: 12,
      color: Color.format(1),
      textShadow: `0px 1px 4px ${Color.format(-0.3)}`,
    }),
    img: css({
      Absolute: 0,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      objectFit: 'cover',
    }),
  };

  const elUrl = (
    <div {...styles.url}>
      <a {...styles.a} href={url}>
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
      onLoad={(e) => {
        console.log('on load', e);
      }}
      onError={(e) => {
        console.log('on error', e);
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elImage}
      {elUrl}
    </div>
  );
};
