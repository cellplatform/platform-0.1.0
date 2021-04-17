import { t, PropListItem } from '../common';

export const ItemUtil = {
  common(connection: t.PeerConnectionStatus) {
    const { id, isOpen, peer, kind, direction } = connection;
    const metadata = connection.metadata as t.PeerConnectionMetadata;
    const module = metadata.module || {};

    const items: PropListItem[] = [
      { label: 'id', value: { data: id, clipboard: true } },
      { label: 'remote peer', value: { data: peer.remote, clipboard: true } },
      { label: 'module', value: `(${direction}) ${module.name}@${module.version}` },
      { label: 'kind', value: kind },
      { label: 'open', value: isOpen },
    ];

    return items;
  },
};
