import { Subject } from 'rxjs';

import * as t from './types';

/**
 * Get the environment.
 */
export function getEnv() {
  const win = window as unknown as t.ITopWindow;
  return win?.env as t.IEnv;
}

/**
 * Get the environment event bus.
 */
export function getEventBus<T = t.Event>() {
  const env = getEnv();
  const event$ = env.event$ || new Subject<void>();
  return event$ as unknown as Subject<T>;
}
