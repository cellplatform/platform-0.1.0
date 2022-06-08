import React, { useState } from 'react';
import { FC, COLORS, css, CssValue, t, MinSize, DEFAULT } from './common';

import { Guides } from './ui/Guides';
import { DocTooSmall } from '../Doc.TooSmall';
import { LayoutSize } from './LayoutSize';

export type DocLayoutContainerProps = {
  tracelines?: boolean;
  min?: { width?: number; height?: number };
  style?: CssValue;
  onResize?: t.DocResizeHandler;
};

const View: React.FC<DocLayoutContainerProps> = (props) => {
  const { tracelines = false, min } = props;
  const [sizes, setSizes] = useState<t.DocLayoutSizes>();

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, color: COLORS.DARK, boxSizing: 'border-box' }),
    body: css({ Absolute: 0, display: 'flex' }),
  };

  const elChildren = React.Children.map(props.children, (child) => {
    return React.isValidElement(child) ? React.cloneElement(child, { sizes }) : child;
  });

  const elBase = sizes && (
    <div {...styles.base}>
      {tracelines && sizes && <Guides sizes={sizes} />}
      <div {...styles.body}>{elChildren}</div>
    </div>
  );

  return (
    <MinSize
      minWidth={min?.width ?? 320}
      minHeight={min?.height ?? 150}
      warningElement={(e) => <DocTooSmall is={e.is} size={e.size} />}
      style={props.style}
      onResize={(e) => {
        const { size, is } = e;
        const sizes = LayoutSize.toSizes(size);
        setSizes(sizes);
        props.onResize?.({ sizes, is });
      }}
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
  LayoutSize: typeof LayoutSize;
};
export const DocLayoutContainer = FC.decorate<DocLayoutContainerProps, Fields>(
  View,
  { DEFAULT, LayoutSize },
  { displayName: 'Doc.LayoutContainer' },
);
