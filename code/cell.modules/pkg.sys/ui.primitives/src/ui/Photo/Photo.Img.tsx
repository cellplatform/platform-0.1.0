import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from './common';

export type PhotoImgProps = {
  def: t.Photo;
  style?: CssValue;
};

export const PhotoImg: React.FC<PhotoImgProps> = (props) => {
  const { def } = props;
  const url = def.url;

  console.log('url', url);

  /**
   * Handlers
   */

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      // backgroundImage: `url(${url})`,
      // backgroundSize: 'cover',
      // backgroundPosition: 'center center',
      Flex: 'center-center',
    }),
    url: css({
      // Absolute: 10,
      // Flex: 'center-center',
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
