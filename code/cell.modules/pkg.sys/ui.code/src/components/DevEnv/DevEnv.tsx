import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type DevEnvProps = { style?: CssValue };

export const DevEnv: React.FC<DevEnvProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>DevEnv</div>;
};
