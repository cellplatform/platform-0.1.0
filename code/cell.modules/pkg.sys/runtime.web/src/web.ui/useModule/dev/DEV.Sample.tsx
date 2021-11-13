import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { useModule } from '..';

export type DevSampleProps = { style?: CssValue };

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>DevSample</div>;
};
