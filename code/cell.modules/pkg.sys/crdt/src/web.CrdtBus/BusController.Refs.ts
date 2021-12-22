import { t, Automerge, rx } from '../common';

type O = Record<string, unknown>;
type DocumentId = string;
type InstanceId = string;
type Ref = { id: DocumentId; data: O };
type Refs = { [id: DocumentId]: Ref };

/**
 * Maintain memory references to documents.
 */
export function BusControllerRefs(args: { bus: t.EventBus<any>; events: t.CrdtEvents }) {
  const { events } = args;
  const id = events.id;
  const bus = rx.busAsType<t.CrdtEvent>(args.bus);
  const refs: Refs = {};

  function wrangleInitial<T extends O>(input: T | (() => T)): T {
    const value = typeof input === 'function' ? input() : input;
    return Automerge.from<T>(value) as T;
  }

  /**
   * Reqest/Response [change].
   */
  events.state.req$.subscribe(async (e) => {
    const { tx } = e;
    const ref = refs[e.doc.id];
    const created = !Boolean(ref);
    const changed = Boolean(e.change);
    let data = ref?.data ?? wrangleInitial(e.initial);
    const prev = data;

    // Apply any changes that may have been requested.
    if (e.change) {
      data = Automerge.change(data, (doc) => e.change?.(doc));
    }

    // Store reference.
    const doc = { id: e.doc.id, data };
    refs[e.doc.id] = doc;

    bus.fire({
      type: 'sys.crdt/ref:res',
      payload: { tx, id, doc, created, changed },
    });

    if (changed) {
      bus.fire({
        type: 'sys.crdt/ref/changed',
        payload: { tx, id, doc: { id: e.doc.id, prev, next: data } },
      });
    }
  });

  /**
   * Remove reference.
   */
  events.state.remove.$.subscribe((e) => {
    delete refs[e.doc.id];
  });

  /**
   * Exists.
   */
  events.state.exists.req$.subscribe((e) => {
    const { tx, doc } = e;
    const exists = Boolean(refs[doc.id]);
    bus.fire({
      type: 'sys.crdt/ref/exists:res',
      payload: { tx, id, doc, exists },
    });
  });
}
