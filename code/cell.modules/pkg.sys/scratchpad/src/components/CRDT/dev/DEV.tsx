import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { DevSample } from './DEV.Sample';
import { rx, t, Automerge } from './common';

type Ctx = {
  count: number;
  bus: t.EventBus<t.CrdtEvent>;
  docs: Automerge.DocSet<t.Doc>;
  current: string;
  redraw(): void;
};

const Helpers = {
  ids(ctx: Ctx) {
    return Array.from(ctx.docs.docIds);
  },

  items(ctx: Ctx) {
    const items = Helpers.ids(ctx).map((id) => ({ id, doc: ctx.docs.getDoc(id) }));
    return {
      total: items.length,
      docs: items.map((item) => item.doc),
      items,
      current: items.find(({ id }) => id === ctx.current),
      others: items.filter(({ id }) => id !== ctx.current),
    };
  },

  write(ctx: Ctx) {
    const docs = Helpers.items(ctx);
    console.log('');
    console.log('total', docs.total);
    docs.items.forEach(({ id, doc }) => {
      console.log('doc', id, doc.count);
    });
  },
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
  .namespace('crdt')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus<t.CrdtEvent>();
    const docs = new Automerge.DocSet<t.Doc>();

    const doc1 = Automerge.from<t.Doc>({ count: 0 });
    const doc2 = Automerge.merge<t.Doc>(Automerge.init(), doc1);
    const doc3 = Automerge.merge<t.Doc>(Automerge.init(), doc2);
    docs.setDoc('doc1', doc1);
    docs.setDoc('doc2', doc2);
    docs.setDoc('doc3', doc3);

    const redraw = () => e.change.ctx((draft) => draft.count++);

    docs.registerHandler(() => {
      Helpers.write(ctx);
      redraw();
    });

    const ctx: Ctx = { bus, docs, current: 'doc1', count: 0, redraw };

    return ctx;
  })

  .items((e) => {
    e.title('Sample');

    e.select((config) => {
      config
        .title('current (doc id)')
        .initial(config.ctx.current)
        .items(Helpers.ids(config.ctx))
        .view('buttons')
        .pipe((e) => {
          e.ctx.current = e.select.current[0].value;
        });
    });

    const changeCount = (ctx: Ctx, by: number) => {
      const id = ctx.current;
      const doc = ctx.docs.getDoc(ctx.current);
      if (!doc) return;
      const next = Automerge.change(doc, (draft) => {
        draft.count = draft.count + by;
        draft.text = `hello-${draft.count}`;
      });
      ctx.docs.setDoc(id, next);
    };

    e.button('increment', (e) => changeCount(e.ctx, 1));
    e.button('decrement', (e) => changeCount(e.ctx, -1));

    e.hr(1, 0.2);

    e.button('merge', (e) => {
      const ctx = e.ctx;
      const items = Helpers.items(ctx);
      const current = items.current;

      if (current) {
        items.others.forEach((item) => {
          const next = Automerge.merge(item.doc, current.doc);
          ctx.docs.setDoc(item.id, next);
        });
      }
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { label: 'CRDT', position: [150, 80], cropmarks: -0.2 },
    });

    const { bus, docs } = e.ctx;
    e.render(<DevSample bus={bus} docs={docs} />);
  });

export default actions;
