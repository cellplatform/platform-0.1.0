import React, { useEffect, useRef, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { DocTooSmall } from '../Doc.TooSmall';
import { COLORS, css, CssValue, DEFAULT, FC, MinSize, rx, t } from './common';
import { LayoutSize } from './LayoutSize';
import { Guides } from './ui/Guides';

export type DocLayoutScrollTop = { top: number };

export type DocLayoutContainerProps = {
  children?: React.ReactNode;
  debug?: boolean | t.DocLayoutContainerDebug;
  min?: { width?: number; height?: number };
  scrollable?: boolean;
  calculate?: t.CalculateDocLayoutSizes;
  rootResize?: t.ResizeObserver | t.ResizeObserverHook;
  scroll$?: t.Observable<DocLayoutScrollTop>;
  style?: CssValue;
  onResize?: t.DocResizeHandler;
};

const View: React.FC<DocLayoutContainerProps> = (props) => {
  const { min, scrollable = true, calculate } = props;
  const debug = toDebug(props.debug);

  const [sizes, setSizes] = useState<t.DocLayoutSizes>();
  const bodyRef = useRef<HTMLDivElement>(null);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    props.scroll$?.pipe(takeUntil(dispose$)).subscribe((e) => {
      if (!bodyRef.current) return;
      bodyRef.current.scrollTop = e.top;
    });

    return dispose;
  }, []); // eslint-disable-line

  /**
   * Handlers
   */
  const handleResize: t.MinSizeResizeEventHandler = (e) => {
    const { size, is } = e;
    const sizes = calculate ? calculate(size) : LayoutSize.calculate(size);
    setSizes(sizes);
    props.onResize?.({ sizes, is });
  };

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
      <div ref={bodyRef} {...styles.body}>
        {elChildren}
      </div>
    </div>
  );

  return (
    <MinSize
      minWidth={min?.width ?? 320}
      minHeight={min?.height ?? 150}
      warningElement={(e) => <DocTooSmall is={e.is} size={e.size} />}
      style={props.style}
      rootResize={props.rootResize}
      onResize={handleResize}
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
  { DEFAULT, LayoutSize: LayoutSize, toDebug },
  { displayName: 'Doc.LayoutContainer' },
);
