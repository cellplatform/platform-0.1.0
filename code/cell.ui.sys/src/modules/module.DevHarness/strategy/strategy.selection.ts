import { delay } from 'rxjs/operators';
import { Module, t } from '../common';

type E = t.HarnessEvent;
type P = t.HarnessProps;

/**
 * Listens for changes to the selected UIHarness tree item.
 */
export function selectionStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;

  const match: t.ModuleFilterEvent = (e) => harness.contains(e.module);
  const events = Module.events<P>(Module.filter(bus.event$, match), harness.dispose$);

  /**
   * HANDLE: selection change in UIHarness tree.
   */
  events.selection$.pipe(delay(0)).subscribe((e) => {
    const { module, data } = e;
    const host = data.host;

    // Store the selected harness `host` configuration.
    harness.change((draft) => {
      const props = draft.props || (draft.props = {});
      const data = props.data || (props.data = {});
      data.host = host;
    });

    // Initiate the render process.
    bus.fire({
      type: 'Harness/render',
      payload: { module, harness: harness.id, view: e.view },
    });
  });
}
