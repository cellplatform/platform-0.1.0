import React, { useEffect, useRef, useState } from 'react';
import { FC, Color, COLORS, css, CssValue, t, MinSize, DEFAULT } from './common';
import { TooSmall } from './ui/TooSmall';

export type DocLayoutContainerProps = {
  tracelines?: boolean;
  style?: CssValue;
  onResize?: t.MinSizeResizeEventHandler;
};

const View: React.FC<DocLayoutContainerProps> = (props) => {
  const { tracelines = false } = props;

  console.log('tracelines', tracelines);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      color: COLORS.DARK,
      boxSizing: 'border-box',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };

  const elBase = <div {...styles.base}>{props.children}</div>;

  return (
    <MinSize
      minWidth={300}
      warningElement={(e) => <TooSmall is={e.is} size={e.size} />}
      style={props.style}
      onResize={props.onResize}
    >
      {elBase}
    </MinSize>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
};
export const DocLayoutContainer = FC.decorate<DocLayoutContainerProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'Doc.LayoutContainer' },
);
