import { t, Automerge } from '../common';

type O = Record<string, unknown>;
type DocumentId = string;
type InstanceId = string;
type Ref = { id: DocumentId; data: O };
type Refs = { [id: DocumentId]: Ref };

/**
 * Maintain memory references to documents.
 */
export function BusControllerRefs(args: {
  id: InstanceId;
  bus: t.EventBus<t.CrdtEvent>;
  events: t.CrdtEvents;
}) {
  const { id, events, bus } = args;
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
    const ref = refs[e.doc];
    const created = !Boolean(ref);
    const changed = Boolean(e.change);
    let data = ref?.data ?? wrangleInitial(e.initial);
    const prev = data;

    // Apply any changes that may have been requested.
    if (e.change) {
      data = Automerge.change(data, (doc) => e.change?.(doc));
    }

    // Store reference.
    const doc = { id: e.doc, data };
    refs[e.doc] = doc;

    bus.fire({
      type: 'sys.crdt/ref:res',
      payload: { tx, id, doc, created, changed },
    });

    if (changed) {
      bus.fire({
        type: 'sys.crdt/ref/changed',
        payload: { tx, id, doc: { id: e.doc, prev, next: data } },
      });
    }
  });

  /**
   * Remove reference.
   */
  events.state.remove.$.subscribe((e) => {
    delete refs[e.doc];
  });

  /**
   * Exists.
   */
  events.state.exists.req$.subscribe((e) => {
    const { tx, doc } = e;
    const exists = Boolean(refs[doc]);
    bus.fire({
      type: 'sys.crdt/ref/exists:res',
      payload: { tx, id, doc, exists },
    });
  });
}
