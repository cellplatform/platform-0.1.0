import { useEffect, useRef, useState, RefObject } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import * as t from '../common/types';
import { DEFAULT, ResizeObserver } from '../resize/ResizeObserver';

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

export function useResizeObserver<H extends HTMLElement = HTMLElement>(
  ref?: RefObject<H>,
  options: t.UseResizeObserverOptions = {},
): t.ResizeObserverHook<H> {
  const [rect, setRect] = useState<t.DomRect>(DEFAULT.RECT);

  const _ref = useRef<H>(null);
  const targetRef = ref ?? _ref;

  const readyRef = useRef(false);
  const rootRef = useRef<t.ResizeObserver>(wrangleObserver(options.root) ?? ResizeObserver());
  const change$ = useRef(new Subject<t.DomRect>());
  const refresh$ = useRef(new Subject<void>());

  useEffect(() => {
    const root = rootRef.current;
    const element = root.watch(targetRef.current as H);

    // Listen to observer.
    element.$.pipe(
      takeUntil(element.dispose$),
      filter((e) => e.payload.rect.x > -1),
    ).subscribe((e) => {
      const size = e.payload.rect;
      setRect(size);
      change$.current.next(size);
      options.onSize?.(size);
    });

    // Force a refresh.
    refresh$.current.pipe(takeUntil(element.dispose$)).subscribe(() => element.refresh());

    // Finish up.
    readyRef.current = true;
    return () => element?.dispose();
  }, [targetRef]); // eslint-disable-line

  return {
    ref: targetRef,
    ready: readyRef.current,
    $: change$.current.asObservable(),
    root: rootRef.current,
    rect,
    refresh: () => refresh$.current.next(),
  };
}

/**
 * [Helpers]
 */

const wrangleObserver = (
  input?: t.ResizeObserver | t.ResizeObserverHook,
): t.ResizeObserver | undefined => {
  return !input ? undefined : (input as any).root ?? input;
};
