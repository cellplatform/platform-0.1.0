import { take } from 'rxjs/operators';

import { rx, t } from '../common';
import { SINGLETON_INSTANCE } from './constants';
import { KeyboardStateMonitor } from './Keyboard.State';

const singletonByBus: { [key: string]: t.KeyboardStateMonitor } = {};

/**
 * Manages a singleton instance of the keyboard state monitor.
 */
export function KeyboardStateSingleton(bus: t.EventBus<any>): t.KeyboardStateMonitor {
  const key = rx.bus.instance(bus);
  if (singletonByBus[key]) return singletonByBus[key];

  const instance = SINGLETON_INSTANCE;
  const monitor = KeyboardStateMonitor({ bus, instance });

  monitor.dispose$.pipe(take(1)).subscribe(() => delete singletonByBus[key]);
  singletonByBus[key] = monitor;
  return monitor;
}
