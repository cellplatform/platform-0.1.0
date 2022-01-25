import { t, PropListItem, PeerNetwork } from '../DEV.common';

export function openHandler(args: {
  bus: t.EventBus<any>;
  kind: t.PeerConnectionKindMedia;
  connection: t.PeerConnectionDataStatus;
}) {
  return async () => {
    const { bus, kind, connection } = args;
    const { self, remote } = connection.peer;
    const parent = connection.id;
    const events = PeerNetwork.PeerEvents(bus);
    await events.connection(self, remote.id).open.media(kind, { parent });
    events.dispose();
  };
}

export const PropUtil = {
  common(connection: t.PeerConnectionStatus) {
    const { id, peer, kind, parent } = connection;
    const module = peer.remote.module;

    const items: PropListItem[] = [
      { label: 'id', value: { data: id, clipboard: true } },
      { label: 'remote peer', value: { data: peer.remote.id, clipboard: true } },
      { label: 'kind', value: `${kind} (${module.name}@${module.version})` },
    ];

    if (parent) {
      items.splice(1, 0, { label: 'parent (connection)', value: parent });
    }

    return items;
  },
};
