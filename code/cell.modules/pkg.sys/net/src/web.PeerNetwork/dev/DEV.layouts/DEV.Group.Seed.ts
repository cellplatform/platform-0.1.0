import { HttpClient } from '@platform/cell.client';

import { PeerNetwork, t, time } from '../DEV.common';

const ns = 'cknxos0ti000e9vetdhii8isv'; // TEMP 🐷

type CellData = { peers: { [key: string]: number } };
export type GroupSeed = {
  init(): Promise<void>;
  clear(): Promise<void>;
  peers(): Promise<CellData['peers']>;
  connect(): Promise<void>;
};

const KEY = {
  lastSelf: 'sys.net/seed/lastSelf',
};

/**
 * Data model and controller that seeds a group of peers with a persistent data source.
 */
export function DevGroupSeed(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
  host: string | number;
  groupname: string;
}): GroupSeed {
  const { groupname, self } = args;
  const client = HttpClient.create(args.host);
  const bus = args.bus as t.EventBus<t.PeerEvent>;
  const events = PeerNetwork.PeerEvents(bus);
  const { dispose, dispose$ } = events;

  let status: t.PeerStatus | undefined;
  const cell = client.cell(`cell:${ns}:A1`);

  const clear = async () => {
    const res = await client.ns(ns).write({
      cells: { A1: { props: { peers: undefined } } },
    });
    return { status: res.status };
  };

  const write = async (id: t.PeerId, options: { remove?: boolean } = {}) => {
    const now = time.now.timestamp;
    const existing = await read();
    const peers = { ...existing, [id]: options.remove ? undefined : now };

    const res = await client.ns(ns).write({
      cells: {
        A1: { props: { peers } },
      },
    });
    return { status: res.status, peers };
  };

  const read = async (): Promise<CellData['peers']> => {
    const info = await cell.info();
    const props = (info.body.data.props || {}) as CellData;
    return props.peers || {};
  };

  /**
   * API
   */
  const api = {
    dispose$,
    dispose,

    async init() {
      const lastSelf = localStorage.getItem(KEY.lastSelf) || undefined;
      localStorage.setItem(KEY.lastSelf, self);
      await api.save(self, lastSelf);
    },

    async connect() {
      const peers = await api.peers();
      const keys = Object.keys(peers).filter((key) => key !== self);

      console.log('peers', keys);

      if (keys.length > 0) {
        for (const remote of keys) {
          const res = await events.connection(self, remote).open.data();
          const isOpen = res.connection?.isOpen;
          if (isOpen) break;
        }
      }
    },

    async clear() {
      await clear();
    },

    async peers() {
      return read();
    },

    async save(id: t.PeerId, removeId?: t.PeerId) {
      if (removeId) await api.remove(removeId);
      return write(id);
    },

    async remove(id: t.PeerId) {
      return write(id, { remove: true });
    },
  };

  return api;
}
