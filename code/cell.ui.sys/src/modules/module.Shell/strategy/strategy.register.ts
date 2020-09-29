import { filter } from 'rxjs/operators';
import { Module, rx, t } from '../common';

type E = t.ShellEvent;
type P = t.ShellProps;

/**
 * Listens for registrations events for the shell.
 */
export function registrationStrategy(args: { shell: t.ShellModule; bus: t.EventBus<E> }) {
  const { shell, bus } = args;
  const fire = Module.fire<P>(bus);

  /**
   * Add module to the shell.
   */
  rx.payload<t.IShellAddEvent>(bus.event$, 'Shell/add')
    .pipe(filter((e) => e.shell === shell.id))
    .subscribe((e) => {
      const child = fire.request(e.module);
      if (child) {
        const parent = e.parent || shell.id;
        Module.register(bus, child, parent);
      }
    });
}

/**
 * Listens for "naked" registrations (where no explicit parent is specified).
 */
export function nakedRegistrationStrategy(args: { shell: t.ShellModule; bus: t.EventBus<E> }) {
  const { shell, bus } = args;

  /**
   * Handle naked registration (no parent id).
   */
  rx.payload<t.IModuleRegisterEvent>(bus.event$, 'Module/register')
    .pipe(filter((e) => !e.parent))
    .subscribe((e) => {
      bus.fire({
        type: 'Shell/add',
        payload: { shell: shell.id, module: e.module },
      });
    });
}
