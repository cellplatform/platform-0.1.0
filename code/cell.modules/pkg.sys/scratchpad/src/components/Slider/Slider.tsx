import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type SliderProps = { style?: CssValue };

export const Slider: React.FC<SliderProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>Slider</div>;
};
