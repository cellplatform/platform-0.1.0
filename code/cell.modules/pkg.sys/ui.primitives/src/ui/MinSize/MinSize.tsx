import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, useResizeObserver, t, toMinSizeFlags, MinSizeDefaults } from './common';

export type MinSizeResizeEvent = { size: t.DomRect; is: t.MinSizeFlags };
export type MinSizeResizeEventHandler = (e: MinSizeResizeEvent) => void;

export type MinSizeProps = {
  children?: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  hideStrategy?: t.MinSizeHideStrategy;
  warningElement?: React.ReactNode;
  rootResize?: t.ResizeObserver;
  style?: CssValue;
  onResize?: MinSizeResizeEventHandler;
};

/**
 * A container element that prevents showing content when
 * the width/height is too small.
 */
export const MinSize: React.FC<MinSizeProps> = (props) => {
  const { minWidth, minHeight, hideStrategy = MinSizeDefaults.hideStrategy } = props;

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef, { root: props.rootResize });

  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [is, setIs] = useState<t.MinSizeFlags>();
  const ok = Boolean(is?.ok);

  /**
   * Lifecycle.
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    /**
     * Bubble resize event.
     */
    const resize$ = resize.$.pipe(takeUntil(dispose$));
    resize$.subscribe((size) => {
      const is = toMinSizeFlags({ size, minWidth, minHeight });
      setIs(is);
      if (props.onResize) props.onResize({ size, is });
    });

    return () => dispose$.next();
  }, [minWidth, minHeight]); // eslint-disable-line

  /**
   * Render
   */
  const styles = {
    base: css({
      pointerEvents: 'none',
      position: 'relative',
      display: 'grid',
    }),
    body: css({
      pointerEvents: 'auto',
      justifySelf: 'stretch',
      alignSelf: 'stretch',
      opacity: !ok && hideStrategy === 'css:opacity' ? 0 : 1,
      display: !ok && hideStrategy === 'css:display' ? 'none' : 'flex',
    }),
    warning: css({
      Absolute: 0,
      display: 'flex',
    }),
  };

  const elWarning = !ok && Boolean(is) ? props.warningElement : undefined;

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
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <div {...styles.body}>{elChildren}</div>
      <div {...styles.warning}>{elWarning}</div>
    </div>
  );
};
