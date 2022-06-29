import { filter } from 'rxjs/operators';

import { slug, t } from './common';
import { GroupEvents } from './GroupEvents';

type InstanceId = string;

/**
 * Event controller for working with a "group" network mesh or peers.
 */
export function GroupController(args: {
  id: InstanceId;
  netbus: t.NetworkBus<any>;
  events: t.WebRuntimeEvents;
  fireLocal: t.FireEvent<t.WebRuntimeEvent>;
}) {
  const { netbus, id } = args;

  const local = args.events;
  const group = GroupEvents({ netbus, id });
  local.dispose$.subscribe(() => group.dispose());

  const __ignore__ = slug();
  const ignoreFilter = (payload: any) => payload.__ignore__ !== __ignore__;

  /**
   * Ferry remote events into the local bus.
   */
  group.$.subscribe((e) => {
    const event = {
      type: e.payload.event.type,
      payload: {
        ...e.payload.event.payload,
        __ignore__, // NB: Used to prevent event broadcast circular-loop.
      },
    };
    args.fireLocal(event as t.WebRuntimeEvent);
  });

  /**
   * Broadcast local events to networked group.
   */
  local.useModule.$.pipe(filter(ignoreFilter)).subscribe((e) => group.useModule.fire(e));

  /**
   * API
   */
  return {};
}
