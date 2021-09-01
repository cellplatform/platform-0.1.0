import { Observable } from 'rxjs';
import * as t from '../common/types';

/**
 * React hook.
 */
export type UseResizeObserver = {
  ready: boolean;
  $: Observable<t.DomRect>;
  root: t.ResizeObserver;
  rect: t.DomRect;
};
