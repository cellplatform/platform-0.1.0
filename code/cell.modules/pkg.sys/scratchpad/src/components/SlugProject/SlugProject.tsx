import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type SlugProjectProps = { style?: CssValue };

export const SlugProject: React.FC<SlugProjectProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      flex: 1,
    }),
  };
  return <div {...css(styles.base, props.style)}>SlugProject</div>;
};
