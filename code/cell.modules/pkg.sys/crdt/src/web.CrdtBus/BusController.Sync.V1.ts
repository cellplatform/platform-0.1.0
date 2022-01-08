import { filter, debounceTime } from 'rxjs/operators';

import { Automerge, rx, t } from './common';

type O = Record<string, unknown>;
type Milliseconds = number;

/**
 * Network sync via [getChanges/applyChanges].
 *
 * NOTE:
 *    This uses the initial API of Automerge.
 *    In the future upgrade to use the Automerge SYNC protocol
 *    that is more efficient (employing Bloom filters).
 */

export function BusControllerSyncV1(args: {
  netbus: t.NetworkBus<any>;
  events: t.CrdtEvents;
  debounce?: Milliseconds;
}) {
  const { events, debounce = 100 } = args;
  const peer = events.id;
  const netbus = args.netbus as t.NetworkBus<t.CrdtSyncV1Event>;

  /**
   * LOCAL: Document initialized.
   */
  events.ref.created$.subscribe((e) => {
    netbus.target.remote({
      type: 'sys.crdt/sync:v1/init',
      payload: { doc: e.doc },
    });
  });

  /**
   * LOCAL: Document document changed.
   */
  events.ref.changed$.pipe(debounceTime(debounce)).subscribe((e) => {
    const changes = Automerge.getChanges<any>(e.doc.prev, e.doc.next);
    const doc = { id: e.doc.id, changes };
    if (doc.changes.length > 0) {
      netbus.target.remote({
        type: 'sys.crdt/sync:v1/changed',
        payload: { peer, doc },
      });
    }
  });

  /**
   * REMOTE: document initialized.
   */
  rx.payload<t.CrdtSyncV1InitEvent>(netbus.$, 'sys.crdt/sync:v1/init')
    .pipe()
    .subscribe(async (e) => {
      const id = e.doc.id;
      const remote = e.doc.data;
      const ref = await events.ref.fire({ id });
      const local = ref.doc.data;

      if (!local) {
        await events.ref.fire({ id, change: Automerge.clone<any>(remote) });
      } else {
        const next = Automerge.merge<any>(local, remote);
        await events.ref.fire({ id, change: next });
      }
    });

  /**
   * REMOTE: document changed.
   */
  rx.payload<t.CrdtSyncV1ChangedEvent>(netbus.$, 'sys.crdt/sync:v1/changed')
    .pipe()
    .subscribe(async (e) => {
      const id = e.doc.id;
      const ref = await events.ref.fire({ id });

      const doc = ref.doc.data;
      if (doc) {
        const changes = e.doc.changes as Automerge.BinaryChange[];
        const [next, patch] = Automerge.applyChanges<any>(doc, changes);
        await events.ref.fire({ id, change: next });
      }
    });
}
