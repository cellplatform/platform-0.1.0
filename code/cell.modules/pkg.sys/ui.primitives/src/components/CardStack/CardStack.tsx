import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type CardStackProps = { style?: CssValue };

export const CardStack: React.FC<CardStackProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>CardStack</div>;
};
