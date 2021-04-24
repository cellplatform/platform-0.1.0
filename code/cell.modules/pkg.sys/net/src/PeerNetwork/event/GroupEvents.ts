import { t } from '../common';
import { Events } from './Events';

/**
 * Helpers for working with group (mesh) related events.
 */
export function GroupEvents(eventbus: t.EventBus<any>) {
  // const { self } = args;
  const events = Events(eventbus);
  // const bus = eventbus.type<t.Group>();

  const connections = (self: t.PeerId) => {
    //
  };

  return {
    self,
    dispose: events.dispose,
    dispose$: events.dispose$,
  };
}
