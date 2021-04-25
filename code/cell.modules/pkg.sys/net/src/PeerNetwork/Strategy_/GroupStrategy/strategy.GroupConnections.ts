import { t, Events, GroupEvents } from '../common';

/**
 * Strategy for retrieving peer/connection details for members of the mesh network.
 */
export async function GroupConnectionsStrategy(args: {
  netbus: t.NetBus<t.GroupEvent>;
  events: t.GroupEvents;
  isEnabled: () => boolean;
}) {
  const { netbus, events } = args;
  const connections = events.connections();

  connections.req$.pipe().subscribe((e) => {
    console.log('group req', e);
  });

  /**
   * TODO 🐷
   */
  // const events = Events(bus);
  // console.log('groupConnections', groupConnections);
  //
}
