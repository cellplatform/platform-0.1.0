import { t, defaultValue } from '../common';
import { focusStrategy } from './strategy.focus';
import { nakedRegistrationStrategy, registrationStrategy } from './strategy.register';

type E = t.ShellEvent;

/**
 * Behavior logic for the module.
 */
export function strategy(args: {
  shell: t.ShellModule;
  bus: t.EventBus;
  acceptNakedRegistrations?: boolean;
}) {
  const { shell } = args;
  const bus = args.bus.type<E>();

  focusStrategy({ shell, bus });

  registrationStrategy({ shell, bus });

  if (defaultValue(args.acceptNakedRegistrations, true)) {
    nakedRegistrationStrategy({ shell, bus });
  }
}
