import { filter } from 'rxjs/operators';
import { Module, rx, t, model } from '../common';

type E = t.ShellEvent;
type P = t.ShellProps;

/**
 * Listens for registrations events for the shell.
 */
export function registrationStrategy(args: { shell: t.ShellModule; bus: t.EventBus<E> }) {
  const { shell, bus } = args;
  const fire = Module.fire<P>(bus);

  const events = Module.events(bus.event$);
  const query = () => Module.Query.create(shell.state);
  const findById = (id: t.NodeIdentifier) => query().findById(id);
  const contains = (id: t.NodeIdentifier) => Boolean(findById(id));

  /**
   * Store registrations on shell model.
   */
  events.registered$
    .pipe(filter((e) => e.parent === shell.id || contains(e.module)))
    .subscribe((e) => {
      shell.change((draft) => {
        const data = model.data(draft);
        const list = (data.registrations = data.registrations || []);
        if (!list.find((item) => item.module === e.module)) {
          list.push({ module: e.module, parent: e.parent || shell.id });
        }
      });
    });

  /**
   * Remove registrations from shell model.
   */
  events.childDisposed$.pipe(filter((e) => contains(e.module))).subscribe((e) => {
    shell.change((draft) => {
      const data = model.data(draft);
      if (data.registrations) {
        const list = (data.registrations = data.registrations || []);
        if (list.find((item) => item.module === e.child)) {
          data.registrations = list.filter((item) => item.module !== e.child);
        }
      }
    });
  });

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
