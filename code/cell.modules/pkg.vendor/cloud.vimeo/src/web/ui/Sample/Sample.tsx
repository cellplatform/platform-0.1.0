import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type SampleProps = { count: number; style?: CssValue };

export const Sample: React.FC<SampleProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>Sample {props.count}</div>;
};
