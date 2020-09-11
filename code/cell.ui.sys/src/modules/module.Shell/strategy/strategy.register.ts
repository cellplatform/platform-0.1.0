import { filter } from 'rxjs/operators';
import { Module, rx, t } from '../common';

type E = t.ShellEvent;
type P = t.ShellProps;

/**
 * Listens for "naked" registrations (where no explicit parent is specified).
 */
export function nakedRegistrationStrategy(args: { shell: t.ShellModule; bus: t.EventBus<E> }) {
  const { shell, bus } = args;
  const fire = Module.fire<P>(bus);

  rx.payload<t.IModuleRegisterEvent>(bus.event$, 'Module/register')
    .pipe(filter((e) => !e.parent))
    .subscribe((e) => {
      if (!e.parent) {
        const child = fire.request(e.module);
        if (child) {
          Module.register(bus, child, shell);
        }
      }
    });
}
