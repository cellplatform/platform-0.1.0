import React from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DevActions } from 'sys.ui.dev';

import { Automerge, rx, t } from './common';
import { DevConnection } from './DEV.Connection';

type Ctx = {
  count: number;
  redraw(): void;
  bus: t.EventBus<t.CrdtEvent>;
  toObject(): {
    list: { id: string; doc: t.Doc }[];
    collection1: t.Docs;
    collection2: t.Docs;
  };
};

const DocStorage = {
  prefix: 'test/crdt/model',
  key: (id: string) => `${DocStorage.prefix}/${id}`,
  load(id: string): t.Doc | undefined {
    const text = localStorage.getItem(DocStorage.key(id));
    return text ? Automerge.load(text) : undefined;
  },
  save(id: string, doc: t.Doc) {
    const text = Automerge.save(doc);
    localStorage.setItem(DocStorage.key(id), text);
  },
  reset() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(DocStorage.prefix))
      .forEach((key) => localStorage.removeItem(key));
  },
};

const loadDocs = () => {
  const load = DocStorage.load;

  const doc1 = load('doc1') || Automerge.from<t.Doc>({ count: 0 });
  const doc2 = load('doc2') || Automerge.merge<t.Doc>(Automerge.init(), doc1);
  const doc3 = load('doc3') || Automerge.merge<t.Doc>(Automerge.init(), doc2);
  const doc4 = load('doc4') || Automerge.merge<t.Doc>(Automerge.init(), doc3);

  const docs = [doc1, doc2, doc3, doc4];
  const list = docs.map((doc, i) => ({ id: `doc${i + 1}`, doc }));
  return list;
};

/**
 * Actions
 *
 * Automerge:
 *  https://github.com/automerge/automerge
 *
 * Perge:
 *  https://github.com/sammccord/perge
 *
 */
export const actions = DevActions<Ctx>()
  .namespace('ModelNetwork/crdt.old')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus<t.CrdtEvent>();
    const collection1 = new Automerge.DocSet<t.Doc>();
    const collection2 = new Automerge.DocSet<t.Doc>();

    const monitor = (docs: Automerge.DocSet<t.Doc>) => {
      const changed$ = new Subject<{ id: string; doc: t.Doc }>();
      docs.registerHandler((id, doc) => changed$.next({ id, doc }));
      changed$.pipe(debounceTime(500)).subscribe((e) => DocStorage.save(e.id, e.doc));
    };

    monitor(collection1);
    const list = loadDocs();

    const redraw = () => e.change.ctx((draft) => draft.count++);

    const ctx: Ctx = {
      count: 0,
      redraw,
      bus,
      toObject() {
        return { list, collection1, collection2 };
      },
    };

    return ctx;
  })

  .items((e) => {
    e.title('Debug');
    e.button('reset', (e) => DocStorage.reset());
    e.button('redraw', (e) => e.ctx.redraw());
    e.hr();

    e.button('add - one', (e) => {
      const { collection1, list } = e.ctx.toObject();
      const { id, doc } = list[0];
      collection1.setDoc(id, doc);
    });

    e.button('add - two', (e) => {
      const { collection2, list } = e.ctx.toObject();
      const { id, doc } = list[3];
      collection2.setDoc(id, doc);
    });

    e.hr(1, 0.1);

    e.button('remove - one', (e) => {
      const { collection1, list } = e.ctx.toObject();
      const { id } = list[0];
      collection1.removeDoc(id);
    });

    e.button('remove - two', (e) => {
      const { collection2, list } = e.ctx.toObject();
      const { id } = list[3];
      collection2.removeDoc(id);
    });

    e.hr();

    e.button('history', (e) => {
      const list = e.ctx.toObject().list;
      const doc = list[0].doc;
      const history = Automerge.getHistory(doc);
      Object.keys(history).forEach((key) => {
        const { change, snapshot } = history[key];
        console.group('🌳 ', key);
        console.log('snapshot', JSON.parse(JSON.stringify(snapshot)));
        console.log('change', change);
        console.groupEnd();
      });
    });

    e.button('conflicts', (e) => {
      const list = e.ctx.toObject().list;
      const doc = list[0].doc;
      const conflicts = Automerge.getConflicts<t.Doc>(doc, 'count');
      console.log('conflicts', conflicts);
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { label: 'CRDT', width: 450, cropmarks: -0.2 },
    });

    const ctx = e.ctx;
    const { bus } = ctx;
    const { collection1: docs1, collection2: docs2 } = ctx.toObject();
    e.render(<DevConnection bus={bus} docs={docs1} />);
    e.render(<DevConnection bus={bus} docs={docs2} />);
  });

export default actions;
