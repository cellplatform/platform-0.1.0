import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type SampleProps = { style?: CssValue };

export const Sample: React.FC<SampleProps> = (props) => {
  const styles = {
    base: css({
      padding: 30,
    }),
  };
  return <div {...css(styles.base, props.style)}>Sample</div>;
};
