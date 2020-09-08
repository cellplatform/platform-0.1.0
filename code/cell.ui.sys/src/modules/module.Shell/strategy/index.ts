import { t } from '../common';
import { focusStrategy } from './strategy.focus';

type E = t.ShellEvent;

/**
 * Behavior logic for the module.
 */
export function strategy(args: { shell: t.ShellModule; bus: t.EventBus }) {
  const { shell } = args;
  const bus = args.bus.type<E>();

  focusStrategy({ shell, bus });
}
