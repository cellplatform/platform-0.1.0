import React, { useEffect, useState } from 'react';
import { takeUntil } from 'rxjs/operators';
import { MinSizeProperties as Properties } from './MinSize.Properties';

import {
  css,
  CssValue,
  useResizeObserver,
  color,
  COLORS,
  t,
  toMinSizeFlags,
  MinSizeDefaults,
  FC,
  rx,
} from './common';

export type MinSizeProps = {
  children?: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  hideStrategy?: t.MinSizeHideStrategy;
  warningElement?: React.ReactNode | t.MinSizeRenderWarning;
  rootResize?: t.ResizeObserver;
  showDebugSize?: boolean;
  style?: CssValue;
  onResize?: t.MinSizeResizeEventHandler;
};

/**
 * A container element that prevents showing content when
 * the width/height is too small.
 */
const View: React.FC<MinSizeProps> = (props) => {
  const { minWidth, minHeight, hideStrategy = MinSizeDefaults.hideStrategy } = props;

  const size = useResizeObserver({ root: props.rootResize });
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [is, setIs] = useState<t.MinSizeFlags>();
  const ok = Boolean(is?.ok);

  /**
   * Lifecycle.
   */
  useEffect(() => {
    const { dispose$, dispose } = rx.disposable();

    /**
     * Bubble resize event.
     */
    const resize$ = size.$.pipe(takeUntil(dispose$));
    resize$.subscribe((size) => {
      const is = toMinSizeFlags({ size, minWidth, minHeight });
      setIs(is);
      if (props.onResize) props.onResize({ size, is });
    });

    return () => dispose();
  }, [minWidth, minHeight]); // eslint-disable-line

  /**
   * Render
   */
  const styles = {
    base: css({
      pointerEvents: 'none',
      position: 'relative',
      display: 'grid',
      boxSizing: 'border-box',
    }),
    body: css({
      pointerEvents: 'auto',
      justifySelf: 'stretch',
      alignSelf: 'stretch',
      opacity: !ok && hideStrategy === 'css:opacity' ? 0 : 1,
      display: !ok && hideStrategy === 'css:display' ? 'none' : 'flex',
    }),
    warning: css({ Absolute: 0, display: 'flex' }),
    size: {
      base: css({
        Absolute: 0,
        backgroundColor: color.alpha(COLORS.MAGENTA, 0.3),
        border: `dashed 1px ${COLORS.MAGENTA}`,
        padding: 6,
      }),
      label: css({
        fontFamily: 'monospace',
        fontWeight: 500,
        fontSize: 11,
        color: COLORS.MAGENTA,
      }),
    },
  };

  const elWarning = (() => {
    if (ok || !is) return undefined;
    if (typeof props.warningElement === 'function') {
      return props.warningElement({ size: size.rect, is });
    }
    return props.warningElement;
  })();

  const elDebugSize = props.showDebugSize && size.ready && (
    <div {...styles.size.base}>
      <div {...styles.size.label}>
        {size.rect.width}x{size.rect.height}
      </div>
    </div>
  );

  const elChildren = (() => {
    if (ok) {
      if (!isRendered) setIsRendered(true);
      return props.children;
    }

    if (isRendered && hideStrategy !== 'unmount') {
      // Too small, but already rendered and there is a CSS strategy
      // that will handling hiding the content (non-destructive).
      return props.children;
    }

    return undefined;
  })();

  return (
    <div ref={size.ref} {...css(styles.base, props.style)}>
      <div {...styles.body}>{elChildren}</div>
      <div {...styles.warning}>{elWarning}</div>
      {elDebugSize}
    </div>
  );
};

/**
 * Export
 */

type Fields = {
  Properties: typeof Properties;
};
export const MinSize = FC.decorate<MinSizeProps, Fields>(
  View,
  { Properties },
  { displayName: 'MinSize' },
);
