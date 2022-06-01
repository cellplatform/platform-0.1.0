import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type DocImageProps = { style?: CssValue };

export const DocImage: React.FC<DocImageProps> = (props) => {
  /**
   * [Render]
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>DocImage</div>;
};
