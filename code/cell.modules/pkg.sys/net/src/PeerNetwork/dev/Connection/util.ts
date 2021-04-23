import { t, PropListItem, PeerNetwork } from '../common';

export function openHandler(args: {
  bus: t.EventBus<any>;
  kind: t.PeerConnectionKindMedia;
  connection: t.PeerConnectionDataStatus;
}) {
  return async () => {
    const { bus, kind, connection } = args;
    const { self, remote } = connection.peer;
    const parent = connection.id;
    const events = PeerNetwork.Events({ bus });
    await events.connection(self, remote).open.media(kind, { parent });
    events.dispose();
  };
}

export const PropUtil = {
  common(connection: t.PeerConnectionStatus) {
    const { id, isOpen, peer, kind, direction, parent, module } = connection;

    const items: PropListItem[] = [
      { label: 'id', value: { data: id, clipboard: true } },
      { label: 'remote peer', value: { data: peer.remote, clipboard: true } },
      { label: 'module', value: `(${direction}) ${module.name}@${module.version}` },
      { label: 'kind', value: kind },
      { label: 'open', value: isOpen },
    ];

    if (parent) {
      items.splice(1, 0, { label: 'parent (connection)', value: parent });
    }

    return items;
  },
};
