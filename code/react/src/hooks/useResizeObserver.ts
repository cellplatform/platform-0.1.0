import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { DEFAULT, ResizeObserver } from '../resize/ResizeObserver';
import * as t from '../common/types';

/**
 * Hook for attaching an monitoring the size of a DOM element.
 *
 * Uses:
 *    https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 *
 *
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
 *    For efficiency a single element observer can be provided.
 *    This is helpful for performance and ensures that infinite callback loops
 *    and cyclic dependencies are avoided.
 *
 *    To use the same {root} observer simply pass the hook response to other hook initializers, eg:
 *
 *        const resize1 = useResizeObserver(myRef1);
 *        const resize2 = useResizeObserver(myRef2, resize1.root);
 *        const resize3 = useResizeObserver(myRef2, resize1);      // NB: Either the hook or the observer can be passed.
 *
 */
export function useResizeObserver(
  ref: React.RefObject<HTMLElement>,
  options: {
    root?: t.ResizeObserver | t.UseResizeObserver;
    onSize?: (size: t.DomRect) => void;
  } = {},
): t.UseResizeObserver {
  const [rect, setRect] = useState<t.DomRect>(DEFAULT.RECT);
  const readyRef = useRef<boolean>(false);

  const rootRef = useRef<t.ResizeObserver>(wrangleObserver(options.root) ?? ResizeObserver());
  const change$ = useRef<Subject<t.DomRect>>(new Subject<t.DomRect>());

  useEffect(() => {
    const root = rootRef.current;
    const element = root.watch(ref.current as HTMLElement);

    element.$.pipe(
      takeUntil(element.dispose$),
      filter((e) => e.payload.rect.x > -1),
    ).subscribe((e) => {
      const size = e.payload.rect;
      setRect(size);
      change$.current.next(size);
      options.onSize?.(size);
    });

    readyRef.current = true;
    return () => element?.dispose();
  }, [ref]); // eslint-disable-line

  return {
    ready: readyRef.current,
    $: change$.current.asObservable(),
    root: rootRef.current,
    rect,
  };
}

/**
 * [Helpers]
 */

const wrangleObserver = (
  input?: t.ResizeObserver | t.UseResizeObserver,
): t.ResizeObserver | undefined => {
  return !input ? undefined : (input as any).root ?? input;
};
