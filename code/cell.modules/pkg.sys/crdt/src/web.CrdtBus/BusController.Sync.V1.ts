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
    const doc = { id: e.id, changes };
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

      // NB: If this is an initial creation no need to merge,
      //     as the remote document is used to start with.
      if (!ref.created && ref.doc.data) {
        const local = ref.doc.data;
        const next = Automerge.merge<any>(local, remote);
        await events.ref.fire({ id, change: next });
      }
    });

  /**
   * REMOTE: document changed.
   */
  rx.payload<t.CrdtSyncV1ChangedEvent>(netbus.$, 'sys.crdt/sync:v1/changed')
    .pipe(filter((e) => e.peer !== peer))
    .subscribe(async (e) => {
      // await merge(e.doc.id, e.doc.data);
      console.log(peer, '||| remote changed', e);
      // const ref
      // const initial = {}; // TEMP 🐷

      // const id = e.doc.id;
      // const ref = await events.ref.fire({ id, initial });

      // console.log('ref', ref);

      // let doc = Automerge.from({ count: 0 });

      // const changes = e.doc.changes as Automerge.BinaryChange[];

      // const res = Automerge.applyChanges<any>(doc, changes);

      // console.log('res', res);

      // console.log('next >>> ', next);
      // console.log('doc', doc);

      // await events.ref.fire({ id, initial, change: next });

      // const next = Automerge.applyChanges()
    });
}
