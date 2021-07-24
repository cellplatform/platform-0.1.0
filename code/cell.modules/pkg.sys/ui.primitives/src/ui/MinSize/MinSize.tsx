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
  warningElement?: React.ReactNode;
  style?: CssValue;
  onResize?: MinSizeResizeEventHandler;
};

/**
 * A container element that prevents showing content when
 * the width/height is too small.
 */
export const MinSize: React.FC<MinSizeProps> = (props) => {
  const { minWidth, minHeight } = props;

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef);
  const [is, setIs] = useState<t.MinSizeFlags>();

  useEffect(() => {
    /**
     * Bubble resize event.
     */
    const dispose$ = new Subject<void>();
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
  const elWarning = !ok ? props.warningElement : undefined;

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elChildren}
      {elWarning}
    </div>
  );
};
