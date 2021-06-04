import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, bundle } from '../../common';

export type SlugProjectProps = { style?: CssValue };

export const SlugProject: React.FC<SlugProjectProps> = (props) => {
  const styles = {
    base: css({
      position: 'relative',
      flex: 1,
      backgroundColor: color.format(1),
    }),
    body: css({
      Absolute: 0,
      Flex: 'horizontal-end-center',
    }),
  };

  const src = bundle.path('static/images/SlugProject/kapow.png');

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <img src={src} />
      </div>
    </div>
  );
};
