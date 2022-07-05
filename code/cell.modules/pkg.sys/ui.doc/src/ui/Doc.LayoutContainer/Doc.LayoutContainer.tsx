import React, { useState } from 'react';
import { FC, COLORS, css, CssValue, t, MinSize, DEFAULT } from './common';

import { Guides } from './view/Guides';
import { DocTooSmall } from '../Doc.TooSmall';
import { LayoutSize } from './LayoutSize';

export type DocLayoutContainerProps = {
  debug?: boolean | t.DocLayoutContainerDebug;
  min?: { width?: number; height?: number };
  scrollable?: boolean;
  style?: CssValue;
  onResize?: t.DocResizeHandler;
};

const View: React.FC<DocLayoutContainerProps> = (props) => {
  const { min, scrollable = true } = props;
  const debug = toDebug(props.debug);
  const [sizes, setSizes] = useState<t.DocLayoutSizes>();

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, color: COLORS.DARK, boxSizing: 'border-box' }),
    body: css({ Absolute: 0, display: 'flex', Scroll: scrollable, overflow: 'hidden' }),
  };

  const elChildren = React.Children.map(props.children, (child) => {
    return React.isValidElement(child) ? React.cloneElement(child, { sizes }) : child;
  });

  const elBase = sizes && (
    <div {...styles.base}>
      {props.debug && sizes && <Guides sizes={sizes} debug={debug} />}
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
 * Helpers
 */
const toDebug = (input: DocLayoutContainerProps['debug']): t.DocLayoutContainerDebug => {
  if (input === false) return {};
  if (input === true) return { tracelines: true, bg: true, renderCount: true, columnSize: true };
  return input ?? {};
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  LayoutSize: typeof LayoutSize;
  toDebug: typeof toDebug;
};
export const DocLayoutContainer = FC.decorate<DocLayoutContainerProps, Fields>(
  View,
  { DEFAULT, LayoutSize, toDebug },
  { displayName: 'Doc.LayoutContainer' },
);
