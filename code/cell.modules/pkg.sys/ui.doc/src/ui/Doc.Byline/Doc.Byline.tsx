import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type DocBylineProps = { style?: CssValue };

export const DocByline: React.FC<DocBylineProps> = (props) => {
  /**
   * [Render]
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>DocByline</div>;
};
