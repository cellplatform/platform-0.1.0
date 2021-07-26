import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Calculate } from './calc';
import { css, CssValue, t, useResizeObserver } from './common';

export type PositioningSize = { root: t.DomRect; child: t.DomRect };
export type PositioningSizeHandler = (e: PositioningSize) => void;

export type PositioningContainerProps = {
  children?: React.ReactNode;
  position?: t.BoxPosition;
  rootResize?: t.ResizeObserver;
  style?: CssValue;
  onSize?: PositioningSizeHandler;
};

/**
 * Manages positioning a single child element based on positioning rules.
 */
export const PositioningContainer: React.FC<PositioningContainerProps> = (props) => {
  const [baseSize, setBaseSize] = useState<t.DomRect | undefined>();

  const rootRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);
  const baseResize = useResizeObserver(rootRef, { root: props.rootResize });
  const childResize = useResizeObserver(childRef, { root: baseResize });

  const position = props.position ?? {};
  const grid = Calculate.grid({ container: baseSize, position });
  const ready = Boolean(grid);

  /**
   * Lifecycle
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const baseResize$ = baseResize.$.pipe(takeUntil(dispose$));
    const childResize$ = childResize.$.pipe(takeUntil(dispose$));

    baseResize$.subscribe((size) => {
      setBaseSize(size);
      props.onSize?.({ root: size, child: getDomRect(childRef.current) });
    });

    childResize$.subscribe((e) => {
      props.onSize?.(getSizeEvent(rootRef, childRef));
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  useEffect(() => {
    props.onSize?.(getSizeEvent(rootRef, childRef));
  }, [position]); // eslint-disable-line

  /**
   * Render
   */
  const styles = {
    base: css({
      pointerEvents: 'none', // NB: Allow clicking through of container element.
      display: 'grid',
      flex: 1,
    }),
    child: css({
      pointerEvents: 'auto',
      position: 'relative',
      display: ready ? 'flex' : 'none',
      justifySelf: grid?.x,
      alignSelf: grid?.y,
    }),
  };

  const elChild = (
    <div ref={childRef} {...styles.child}>
      {props.children}
    </div>
  );

  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {elChild}
    </div>
  );
};

/**
 * Helpers
 */

const emptyRect: t.DomRect = {
  x: -1,
  y: -1,
  width: -1,
  height: -1,
  top: -1,
  right: -1,
  bottom: -1,
  left: -1,
};

function getDomRect(el?: HTMLElement | null): t.DomRect {
  if (!el) return { ...emptyRect };
  const { x, y, width, height } = getDimensions(el);
  return { x, y, width, height, top: y, right: x + width, bottom: y + height, left: x };
}

function getDimensions(el: HTMLElement) {
  return {
    width: el.offsetWidth,
    height: el.offsetHeight,
    x: el.offsetLeft,
    y: el.offsetTop,
  };
}

function getSizeEvent(
  rootRef: React.RefObject<HTMLDivElement>,
  childRef: React.RefObject<HTMLDivElement>,
) {
  return {
    root: getDomRect(rootRef.current),
    child: getDomRect(childRef.current),
  };
}
