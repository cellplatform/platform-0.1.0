import { t, PropListItem } from '../common';

export const ItemUtil = {
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
