import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue } from '../../common';

export type AvatarProps = {
  url?: string;
  style?: CssValue;
};

export const Avatar: React.FC<AvatarProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ borderRadius: 64, overflow: 'hidden' }),
    image: css({ width: 64, display: 'block' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      {props.url && <img src={props.url} {...styles.image} />}
    </div>
  );
};
