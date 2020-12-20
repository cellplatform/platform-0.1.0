import { t } from '../../common';

import * as Automerge from 'automerge';

/**
 * Test CRDT
 * https://github.com/automerge/automerge
 */
export function crdt(args: { bus: t.CodeEditorEventBus }) {
  console.log('automerge', Automerge);

  type D = { text: Automerge.Text };

  let doc1 = Automerge.from<D>({ text: new Automerge.Text() });

  doc1 = Automerge.change(doc1, (doc) => {
    // doc.text = doc.text || new Automerge.Text();
    const text = doc.text as any;
    text.insertAt(0, 'h', 'e', 'l', 'l', 'o');
    text.deleteAt(0);
    text.insertAt(0, 'H');
  });

  let doc2 = Automerge.init<D>();
  doc2 = Automerge.merge(doc2, doc1);

  doc1 = Automerge.change(doc1, (doc) => {
    const text = doc.text as any;
    text.insertAt(5, '.');
  });

  doc2 = Automerge.change(doc2, (doc) => {
    console.log('doc.text', doc.text);
    const text = doc.text as any;
    // text.deleteAt(5);
    text.insertAt(5, '!');
  });

  console.group('🌳 doc1');
  console.log(doc1.text?.length);
  console.log(doc1.text?.get(0));
  console.log(doc1.text?.toString());
  console.groupEnd();

  console.group('🌳 doc2');
  console.log(doc2.text?.toString());
  console.groupEnd();

  doc1 = Automerge.merge(doc1, doc2);
  console.log('doc1.text.toString()', doc1.text.toString());
}
