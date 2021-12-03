import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { css, color, Automerge } from '../../common';

type Card = { title: string; done: boolean };
type Doc = { cards: Card[] };

type Ctx = {
  doc: Doc;
  getDoc(): Doc;
  setDoc(doc: Doc): void;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Sample')
  .context((e) => {
    if (e.prev) return e.prev;

    const doc = Automerge.from<Doc>({ cards: [] });

    const ctx: Ctx = {
      doc,
      getDoc() {
        return doc;
      },
      setDoc(doc) {
        e.change.ctx((ctx) => (ctx.doc = doc));
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('mutate');

    e.button('add card', (e) => {
      const d = e.ctx.getDoc();
      console.log('d', d);

      const next = Automerge.change(e.ctx.doc, 'add card', (doc) => {
        const title = `card-${doc.cards.length + 1}`;
        doc.cards.push({ title, done: false });
      });

      console.log('next', next);
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Sample>',
        // position: [150, 80],
        width: 300,
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const styles = {
      base: css({
        boxSizing: 'border-box',
        padding: 12,
      }),
    };

    const el = (
      <div {...styles.base}>
        <ObjectView name={'crdt'} data={e.ctx.doc} />
      </div>
    );

    e.render(el);

    // e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
