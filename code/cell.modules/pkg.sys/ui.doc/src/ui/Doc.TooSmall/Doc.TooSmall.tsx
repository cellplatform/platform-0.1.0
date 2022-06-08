import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../common';

export type DocTooSmallProps = {
  size: t.DomRect;
  is: t.MinSizeFlags;
  style?: CssValue;
};

export const DocTooSmall: React.FC<DocTooSmallProps> = (props) => {
  const { is, size } = props;

  if (size.height < 45) return null;
  if (size.width < 140) return null;

  let message = 'Screen is too small.';
  if (is.tooNarrow && !is.tooShort) message = `Screen is too narrow.`;
  if (!is.tooNarrow && is.tooShort) message = `Screen is too short.`;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'center-center',
    }),
    message: css({
      fontSize: 12,
      fontStyle: 'italic',
      opacity: 0.6,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.message}>{message}</div>
    </div>
  );
};
