import { RefObject, useEffect } from 'react';

type M = GlobalEventHandlersEventMap;

/**
 * Hook that handles checking if addEventListener is supported,
 * adding the event listener,and removal on cleanup.
 *
 * Source (MIT):
 *    https://www.jclem.net/posts/pan-zoom-canvas-react
 *
 */
export function useEventListener<K extends keyof M>(
  ref: RefObject<HTMLElement | null>,
  event: K,
  listener: (event: M[K]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const listenerWrapper = ((e: M[K]) => listener(e)) as EventListener;
    node.addEventListener(event, listenerWrapper, options);

    return () => node.removeEventListener(event, listenerWrapper);
  }, [ref, event, listener, options]);
}
