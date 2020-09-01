import { filter, takeUntil } from 'rxjs/operators';

import { Module, rx, t } from '../common';

type E = t.HarnessEvent;
type P = t.HarnessProps;

/**
 * Add modules that register themselves to be inserted into the DevHarness.
 */
export function addModuleStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;
  const $ = bus.event$.pipe(takeUntil(harness.dispose$));
  const fire = Module.fire<P>(bus);

  rx.payload<t.IHarnessAddEvent>($, 'Harness/add')
    .pipe(filter((e) => !harness.contains(e.module)))
    .subscribe((e) => {
      const child = fire.request(e.module);
      if (child) {
        Module.register(bus, child, harness.id);
      }
    });
}
