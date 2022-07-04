import { filter, debounceTime } from 'rxjs/operators';

import { Automerge, rx, t } from './common';

import { Hash } from '@platform/cell.schema';

type O = Record<string, unknown>;
type D = Automerge.FreezeObject<O>;
type Milliseconds = number;
type DocumentId = string;
type PeerId = string;
type SyncStates = { [peer: PeerId]: { [doc: DocumentId]: Automerge.SyncState } };

/**
 * Network synchronization (using "bloom filters")
 *
 * Refs:
 *    Paper (Theory):       https://arxiv.org/abs/2012.00472
 *    Blog Post:            https://martin.kleppmann.com/2020/12/02/bloom-filter-hash-graph-sync.html
 *    Lib Unit-Tests:       https://github.com/automerge/automerge/blob/main/test/sync_test.js#L15-L35
 *
 */
export function BusControllerSync(args: {
  netbus: t.NetworkBus<any>;
  events: t.CrdtEvents;
  debounce?: Milliseconds;
}) {
  const { events, debounce = 100 } = args;
  const local = events.instance.id;
  const netbus = args.netbus as t.NetworkBus<t.CrdtSyncEvent>;
  const incoming$ = rx
    .payload<t.CrdtSyncSendEvent>(netbus.$, 'sys.crdt/sync/send')
    .pipe(filter((e) => e.source !== local));

  console.group('// BusControllerSync //');
  console.log('local', local);
  console.groupEnd();

  const syncStates: SyncStates = {};
  const peerSyncStates = (peer: PeerId) => syncStates[peer] || (syncStates[peer] = {});

  /**
   * Calculate and send sync message to a given peer.
   */
  const syncToPeer = (remote: PeerId, doc: { id: DocumentId; data: O }) => {
    const id = doc.id;
    const data = doc.data as D;
    const ref = peerSyncStates(remote);
    const before = ref[id] || Automerge.initSyncState();
    const [after, message] = Automerge.generateSyncMessage(data, before);
    ref[id] = after;

    if (message) {
      console.log('🌼 OUT from', local, '| HASH\n', Hash.sha256(message));

      netbus.target.node(remote).fire({
        type: 'sys.crdt/sync/send',
        payload: { source: local, doc: { id }, sync: { message } },
      });
    }
  };

  const syncToPeers = async (doc: { id: DocumentId; data: O }) => {
    const remotes = (await netbus.uri()).remotes;
    remotes.forEach((remote) => syncToPeer(remote, doc));
  };

  /**
   * LOCAL: Document initialized.
   */
  events.ref.created$.subscribe((e) => {
    syncToPeers(e.doc);
  });

  /**
   * LOCAL: Document changed.
   *        Broadcast change with all remote peers.
   */
  events.ref.changed$.pipe(debounceTime(debounce)).subscribe(async (e) => {
    const id = e.doc.id;
    const data = (await events.ref.fire({ id })).doc.data;
    if (data) syncToPeers({ id, data });
  });

  /**
   * REMOTE: incoming sync messages.
   */
  incoming$.subscribe(async (e) => {
    // Retrieve the CRDT document.
    const id = e.doc.id;
    const before = ((await events.ref.fire({ id })).doc.data as D) || Automerge.init();

    // Process the received message against local sync-state.
    const ref = peerSyncStates(e.source);
    const syncStateBefore = ref[id] || Automerge.initSyncState();
    const message = new Uint8Array(e.sync.message) as Automerge.BinarySyncMessage;
    const received = Automerge.receiveSyncMessage(before, syncStateBefore, message);

    console.log('🌳 IN from', e.source, '| HASH\n', Hash.sha256(message));

    // console.group('🌳 INCOMING, local', local);
    // console.log('e', e);
    // console.log('message hash\n', Hash.sha256(message));
    // console.groupEnd();

    // Update local document.
    ref[id] = received[1]; // sync-state (after).
    const next = received[0]; // document.
    await events.ref.fire({ id, change: next });
  });
}
