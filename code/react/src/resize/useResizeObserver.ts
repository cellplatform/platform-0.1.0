import { useEffect, useRef, useState } from 'react';
import { DEFAULT, ResizeObserver } from './ResizeObserver';
import * as t from './types';

export type UseResizeObserver<T extends HTMLElement> = {
  root: t.ResizeObserver;
  ref: React.RefObject<T>;
  rect: t.DomRect;
};

/**
 * Hook for attaching an monitoring the size of a DOM element.
 */
export function useResizeObserver<T extends HTMLElement>(
  options: { root?: t.ResizeObserver } = {},
): UseResizeObserver<T> {
  const root = options.root || ResizeObserver();
  const ref = useRef<T>(null);
  const [rect, setRect] = useState<t.DomRect>(DEFAULT.RECT);

  useEffect(() => {
    const element = root.watch(ref.current as T);
    element.$.subscribe((e) => setRect(e.payload.rect));
    return () => element.dispose();
  }, []); // eslint-disable-line

  return { root, ref, rect };
}
