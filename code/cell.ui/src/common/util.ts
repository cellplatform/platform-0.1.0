import { Subject } from 'rxjs';

import * as t from './types';

const win = (window as unknown) as t.ITopWindow;

/**
 * Get the environment.
 */
export function getEnv() {
  return win.env;
}

/**
 * Get the environment event bus.
 */
export function getEventBus<T = t.Event>() {
  const env = getEnv();
  const event$ = env.event$ || new Subject();
  return (event$ as unknown) as Subject<T>;
}
