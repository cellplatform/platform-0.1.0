import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, k } from '../common';

export type DebugProps = k.BulletItemProps & { style?: CssValue };

export const Debug: React.FC<DebugProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>DefaultDebug</div>;
};
