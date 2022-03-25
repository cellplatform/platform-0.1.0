import { RefObject } from 'react';

import { Observable } from 'rxjs';
import * as t from '../common/types';

/**
 * React hook (output).
 */
export type ResizeObserverHook<H extends HTMLElement = HTMLElement> = {
  ref: RefObject<H>;
  $: Observable<t.DomRect>;
  ready: boolean;
  root: t.ResizeObserver;
  rect: t.DomRect;
  refresh(): void;
};

/**
 * Hook factory.
 */
export type UseResizeObserverOptions = {
  root?: t.ResizeObserver | t.ResizeObserverHook;
  onSize?: (size: t.DomRect) => void;
};
