import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, useResizeObserver, t, toMinSizeFlags } from './common';

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
  const { minWidth, minHeight, hideStrategy = 'css:opacity' } = props;

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef, { root: props.rootResize });
  const [is, setIs] = useState<t.MinSizeFlags>();

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

  const styles = {
    base: css({ position: 'relative', display: 'flex' }),
  };

  const ok = Boolean(is?.ok);
  const elChildren = ok ? props.children : undefined;
  const elWarning = !ok && Boolean(is) ? props.warningElement : undefined;

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elChildren}
      {elWarning}
    </div>
  );
};
