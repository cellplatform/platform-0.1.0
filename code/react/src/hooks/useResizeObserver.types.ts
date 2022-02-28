import { Observable } from 'rxjs';
import * as t from '../common/types';

/**
 * React hook.
 */
export type UseResizeObserver = {
  $: Observable<t.DomRect>;
  ready: boolean;
  root: t.ResizeObserver;
  rect: t.DomRect;
  refresh(): void;
};
