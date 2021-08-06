import { t, rx, Events } from '../common';

/**
 * Event controller.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.CompilerEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  return {
    dispose,
    dispose$,
  };
}
