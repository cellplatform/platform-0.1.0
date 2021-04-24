import { t } from '../common';
import { Events } from '../Event';

/**
 * Strategy for retrieving peer/connection details for members of the mesh network.
 */
export async function groupConnections(args: {
  self: t.PeerId;
  events: t.PeerNetworkEvents;
  isEnabled: () => boolean;
}) {
  const { self } = args;

  /**
   * TODO 🐷
   */
  // const bus = args.bus.type<t.PeerEvent>();
  // const events = Events({ bus });

  // console.log('groupConnections', groupConnections);

  //
}
