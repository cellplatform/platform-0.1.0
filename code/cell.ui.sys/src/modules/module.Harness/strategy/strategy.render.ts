import { Module, t } from '../common';
import { renderer } from '../Module.render';

type E = t.HarnessEvent;
type P = t.HarnessProps;

/**
 * Listens for UIHarness render requests.
 */
export function renderStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;
  const match: t.ModuleFilterEvent = (e) => e.module == harness.id;
  const events = Module.events<P>(Module.filter(bus.event$, match), harness.dispose$);
  renderer({ harness, bus, events });
}
