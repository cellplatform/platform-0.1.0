import { Test, expect } from '../test';
import { rx, Automerge, Filesystem, t, cuid } from '../common';

/**
 * https://github.com/automerge/automerge
 */
export default Test.describe('Automerge (CRDT)', (e) => {
  type Card = { title: string; done: boolean };
  type Doc = { cards: Card[] };

  const PATH = {
    ROOT: 'tmp/test/Automerge',
  };

  const bus = rx.bus();
  let fs: t.Fs;

  const getFilesystem = async (options: { clear?: boolean } = {}) => {
    const id = 'dev.sys.crdt';
    const local = fs ?? (fs = (await Filesystem.IndexedDb.create({ bus, id })).fs);
    if (options.clear) await clearTestFiles(local);
    return local;
  };

  const clearTestFiles = async (fs: t.Fs) => {
    const manifest = await fs.manifest();
    const files = manifest.files.filter((file) => file.path.startsWith(PATH.ROOT));
    const paths = files.map((file) => file.path);
    for (const path of paths) {
      await fs.delete(path);
    }
  };

  e.describe('data manipulation', (e) => {
    e.it('create `.init` (frozen)', () => {
      const doc = Automerge.init();
      expect(doc).to.eql({});
      expect(Object.isFrozen(doc)).to.eql(true); // Frozen by default.
    });

    e.it('create `.from` with initial state', () => {
      const initial: Doc = { cards: [] };
      const doc = Automerge.from<Doc>(initial);
      expect(doc).to.eql(initial);
      expect(doc).to.not.equal(initial); // NB: Different instance.
      expect(Object.isFrozen(doc)).to.eql(false); // Not frozen by default.
    });

    e.it('create `.from` (frozen)', () => {
      const doc = Automerge.from<Doc>({ cards: [] }, { freeze: true });
      expect(Object.isFrozen(doc)).to.eql(true);
    });

    e.describe('actorId', (e) => {
      e.it('getActorId', () => {
        const doc = Automerge.from<Doc>({ cards: [] });
        const id = Automerge.getActorId(doc);
        expect(id.length).to.greaterThan(25);
        expect(typeof id).to.eql('string');
      });

      e.it('custom id (via `.init`)', () => {
        const actorId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const doc = Automerge.init(actorId);
        expect(Automerge.getActorId(doc)).to.eql(actorId);
      });

      e.it('custom id (via `.from`)', () => {
        const initial: Doc = { cards: [] };
        const actorId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const doc = Automerge.from<Doc>(initial, actorId);
        expect(doc).to.eql(initial);
        expect(Automerge.getActorId(doc)).to.eql(actorId);
      });
    });

    e.describe('change (immutable mutation)', (e) => {
      e.it('named change "add card"', () => {
        const doc1 = Automerge.from<Doc>({ cards: [] });
        const doc2 = Automerge.change<Doc>(doc1, 'Add card', (doc) => {
          doc.cards.push({ title: 'hello', done: false });
        });

        expect(doc2).to.not.equal(doc1); // NB: Different instance.

        expect(doc1).to.eql({ cards: [] });
        expect(doc2).to.eql({ cards: [{ title: 'hello', done: false }] });
      });

      e.it('retrieves changes (Uint8Array)', () => {
        const doc1 = Automerge.from<Doc>({ cards: [] });
        const doc2 = Automerge.change<Doc>(doc1, 'Add card', (doc) => {
          doc.cards.push({ title: 'hello', done: false });
        });

        const changes = Automerge.getChanges<Doc>(doc1, doc2);
        expect(changes[0] instanceof Uint8Array).to.eql(true);
        expect(changes[0].length).to.eql(139);
      });
    });
  });

  e.describe('merging (multi-document)', (e) => {
    /**
     * Based on sample in README
     * https://github.com/automerge/automerge
     */
    e.it('simple merge', () => {
      /**
       * Initial document: "doc1"
       */
      let doc1 = Automerge.from<Doc>({ cards: [] });
      doc1 = Automerge.change<Doc>(doc1, 'Add card', (doc) => {
        doc.cards.push({ title: 'hello-1a', done: false });
      });
      doc1 = Automerge.change<Doc>(doc1, 'Add another card', (doc) => {
        doc.cards.push({ title: 'hello-2a', done: false });
      });

      expect(doc1).to.eql({
        cards: [
          { title: 'hello-1a', done: false },
          { title: 'hello-2a', done: false },
        ],
      });

      /**
       * Second document: "doc2"
       */
      let doc2 = Automerge.init<Doc>();
      doc2 = Automerge.merge(doc2, doc1);
      expect(doc2).to.eql(doc1); // NB: Newly minted document bought up-to-date with the prior document.

      /**
       * Make competing changes.
       */
      doc1 = Automerge.change<Doc>(doc1, 'Mark card as complete', (doc) => {
        doc.cards[0].done = true;
      });
      doc2 = Automerge.change<Doc>(doc2, 'Delete card', (doc) => {
        delete doc.cards[1];
      });

      expect(doc1.cards[0].done).to.eql(true);
      expect(doc2.cards[0].done).to.eql(false);

      expect(doc1.cards.length).to.eql(2);
      expect(doc2.cards.length).to.eql(1);

      // NB: Cloning not necessary, only because we are testing both ways
      //     and the document throw an error if merged twice with/from the same input.
      const merged = {
        a: Automerge.merge(Automerge.clone(doc1), Automerge.clone(doc2)),
        b: Automerge.merge(Automerge.clone(doc2), Automerge.clone(doc1)),
      };
      expect(merged.a).to.eql(merged.b);

      /**
       * Examine history.
       */
      const history = Automerge.getHistory(merged.a);
      expect(history.length).to.eql(5);

      const summary = history.map((state) => [state.change.message, state.snapshot.cards.length]);
      expect(summary).to.eql([
        ['Initialization', 0],
        ['Add card', 1],
        ['Add another card', 2],
        ['Mark card as complete', 2],
        ['Delete card', 1],
      ]);
    });
  });

  e.describe('filesystem (Uint8Array)', (e) => {
    async function getSampleDoc() {
      const doc = Automerge.from<Doc>({ cards: [] });
      return Automerge.change<Doc>(doc, 'Add card', (doc) => {
        doc.cards.push({ title: 'hello', done: false });
      });
    }

    e.it('save binary', async () => {
      const fs = await getFilesystem({ clear: true });
      const doc = await getSampleDoc();
      const path = fs.join(PATH.ROOT, 'myfile.crdt');
      const binary = Automerge.save(doc);

      expect(await fs.exists(path)).to.eql(false);
      await fs.write(path, binary);
      expect(await fs.exists(path)).to.eql(true);
    });

    e.it('load from saved binary', async () => {
      const fs = await getFilesystem({ clear: true });
      const doc1 = await getSampleDoc();

      const STATE = { cards: [{ title: 'hello', done: false }] };
      expect(doc1).to.eql(STATE);

      const path = fs.join(PATH.ROOT, 'myfile.crdt');
      await fs.write(path, Automerge.save(doc1));

      const binary = (await fs.read(path)) as Automerge.BinaryDocument;

      const doc2 = Automerge.load(binary);
      expect(doc2).to.eql(STATE);

      const getActorId = Automerge.getActorId;
      expect(getActorId(doc1)).to.not.eql(getActorId(doc2));

      // Automerge.Backend.
    });
  });

  e.describe.skip('TODO: Network (EventBus)', (e) => {
    //
  });
});
