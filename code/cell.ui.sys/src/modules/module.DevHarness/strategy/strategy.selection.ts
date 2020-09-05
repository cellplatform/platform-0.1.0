import { delay } from 'rxjs/operators';
import { Module, t } from '../common';

type E = t.HarnessEvent;
type P = t.HarnessProps;

/**
 * Listens for changes to the selected DevHarness tree item.
 */
export function selectionStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;

  const match: t.ModuleFilterEvent = (e) => harness.contains(e.module);
  const events = Module.events<P>(Module.filter(bus.event$, match), harness.dispose$);

  /**
   * HANDLE: Initiate the render process on selection
   *         change in DevHarness tree.
   */
  events.selection$.pipe(delay(0)).subscribe((e) => {
    bus.fire({
      type: 'Harness/render',
      payload: {
        harness: harness.id,
        module: e.module,
        view: e.view,
        host: e.data.host,
      },
    });
  });
}
