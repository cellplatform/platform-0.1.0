import { RefObject } from 'react';

/**
 * Hook
 */
export type FocusHook<T extends HTMLElement> = {
  readonly ref: RefObject<T>;
  readonly containsFocus: boolean;
  readonly withinFocus: boolean;
  redraw(): void;
};
