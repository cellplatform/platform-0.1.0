import { useEffect, useState, useRef } from 'react';
import { DEFAULT, ResizeObserver } from '../resize/ResizeObserver';
import * as t from '../types';

/**
 * Hook for attaching an monitoring the size of a DOM element.
 * USAGE:
 *
 *    First create the hook:
 *
 *        const myRef = useRef<HTMLDivElement>(null);
 *        const resize = useResizeObserver(myRef);
 *
 *    Ensure the DOM element reference is attachedL
 *
 *        <div ref={myRef}>
 *
 *    Then use the [resize.rect] values that are updated as state.
 *
 *    For efficiency a single element observer can added to.
 *    This is helpful for performance and ensures that infinite callback loops
 *    and cyclic dependencies are avoided.
 *
 *    To use the same {root} observer simply pass the hook response to other hook initializers, eg:
 *
 *        const resize1 = useResizeObserver(myRef1);
 *        const resize2 = useResizeObserver(myRef2, resize1);
 *
 */
export function useResizeObserver(
  ref: React.RefObject<HTMLElement>,
  options: { root?: t.ResizeObserver } = {},
): t.UseResizeObserver {
  const root = options.root || ResizeObserver();
  const [rect, setRect] = useState<t.DomRect>(DEFAULT.RECT);
  const ready = useRef<boolean>(false);

  useEffect(() => {
    const element = root.watch(ref.current as HTMLElement);
    element.$.subscribe((e) => setRect(e.payload.rect));
    ready.current = true;
    return () => element.dispose();
  }, []); // eslint-disable-line

  return { ready: ready.current, root, rect };
}
