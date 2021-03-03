import { Observable } from 'rxjs';
import * as t from '../types';

/**
 * React hook.
 */
export type UseResizeObserver = {
  ready: boolean;
  $: Observable<t.DomRect>;
  root: t.ResizeObserver;
  rect: t.DomRect;
};
