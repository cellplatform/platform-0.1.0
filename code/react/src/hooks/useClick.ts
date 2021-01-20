import { RefObject, useEffect } from 'react';

type E = HTMLElement;
type Stage = 'down' | 'up';

/**
 * Monitors for click events outside the given element.
 * Usage:
 *    Useful for clicking away from modal dialogs or popups.
 */
export function useClickOutside(
  stage: Stage,
  ref: RefObject<E>,
  callback?: (e: MouseEvent) => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (callback && !ref.current?.contains(e.target as E)) callback(e);
    };
    const event = asEventName(stage);
    document?.addEventListener(event, handler, true);
    return () => document?.removeEventListener(event, handler, true);
  }, [stage, ref, callback]);
}

/**
 * Monitors for click events within the given element.
 * Usage:
 *    Useful for clicking away from modal dialogs or popups.
 */
export function useClickWithin(
  stage: Stage,
  ref: RefObject<E>,
  callback?: (e: MouseEvent) => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (callback && ref.current?.contains(e.target as E)) callback(e);
    };
    const event = asEventName(stage);
    document?.addEventListener(event, handler, true);
    return () => document?.removeEventListener(event, handler, true);
  }, [stage, ref, callback]);
}

/**
 * Helpers
 */

function asEventName(stage: Stage) {
  if (stage === 'down') return 'mousedown';
  if (stage == 'up') return 'mouseup';
  throw new Error(`'${stage}' not supported`);
}
