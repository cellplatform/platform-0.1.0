import { delay } from 'rxjs/operators';
import { Module, t } from '../common';

type E = t.HarnessEvent;
type P = t.HarnessProps;

/**
 * Listens for changes to the selected UIHarness tree item.
 */
export function selectionStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;
  const fire = Module.fire(bus);

  const match: t.ModuleFilterEvent = (e) => harness.contains(e.module);
  const events = Module.events<P>(Module.filter(bus.event$, match), harness.dispose$);

  const renderHarness = (view: t.HarnessView) => fire.render({ module: harness, view });

  /**
   * HANDLE: selection change in UIHarness tree.
   */
  events.selection$.pipe(delay(0)).subscribe((e) => {
    const { module, data } = e;
    const host = data.host;

    if (host) {
      renderHarness('HOST/component');
      fire.render({ module, data, view: host.view });
    } else {
      renderHarness('HOST/module');
      const res = fire.render({ module, data, view: e.view });
      if (!res) {
        renderHarness('404');
      }
    }

    // Store the selected UIHarness `host` configuration.
    harness.change((draft) => {
      const props = draft.props || (draft.props = {});
      const data = props.data || (props.data = {});
      data.host = host;
    });
  });
}
