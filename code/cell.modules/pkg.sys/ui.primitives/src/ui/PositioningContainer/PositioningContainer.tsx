import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Calculate } from './calc';
import { css, CssValue, t, useResizeObserver } from './common';

export type PositioningContainerResizeEvent = { size: t.DomRect };
export type PositioningContainerResizeEventHandler = (e: PositioningContainerResizeEvent) => void;

export type PositioningContainerProps = {
  children?: React.ReactNode;
  position?: t.BoxPosition;
  rootResize?: t.ResizeObserver;
  style?: CssValue;
  onResize?: PositioningContainerResizeEventHandler;
};

/**
 * Manages positioning a single child element based on positioning rules.
 */
export const PositioningContainer: React.FC<PositioningContainerProps> = (props) => {
  const [baseSize, setBaseSize] = useState<t.DomRect | undefined>();
  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef, { root: props.rootResize });

  const position = props.position ?? {};
  const grid = Calculate.grid({ container: baseSize, position });
  const ready = Boolean(grid);

  /**
   * Lifecycle
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const resize$ = resize.$.pipe(takeUntil(dispose$));

    resize$.subscribe((size) => {
      props.onResize?.({ size });
      setBaseSize(size);
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  /**
   * Render
   */
  const styles = {
    base: css({
      flex: 1,
      pointerEvents: 'none', // NB: Allow clicking through of container element.
      display: 'grid',
    }),
    child: css({
      position: 'relative',
      display: 'flex',
      pointerEvents: 'auto',
      justifySelf: grid?.x,
      alignSelf: grid?.y,
    }),
  };

  const elChild = ready && <div {...styles.child}>{props.children}</div>;

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elChild}
    </div>
  );
};
