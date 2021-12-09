import { Test, expect } from '../test';
import { rx, Automerge, Filesystem, t, cuid } from '../common';

/**
 * https://github.com/automerge/automerge
 * https://github.com/automerge/automerge/blob/main/SYNC.md
 */
export default Test.describe('Automerge (CRDT)', (e) => {
  type Card = { title: string; done: boolean };
  type Doc = {
    name?: string;
    cards: Automerge.List<Card>; // NB: An [Array] type with extension methods (eg. insertAt)
    json?: any;
  };

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

  function createDoc() {
    return Automerge.from<Doc>({ cards: [] });
  }

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

      e.it('`.getChanges` retrieves change-set (Uint8Array)', () => {
        const doc1 = Automerge.from<Doc>({ cards: [] });
        const doc2 = Automerge.change<Doc>(doc1, 'Add card', (doc) => {
          doc.cards.push({ title: 'hello', done: false });
        });

        const changes = Automerge.getChanges<Doc>(doc1, doc2);
        expect(changes[0] instanceof Uint8Array).to.eql(true);
        expect(changes[0].length).to.eql(139);
      });

      e.it('`delete obj.prop` => undefined', () => {
        let doc = createDoc();

        doc = Automerge.change<Doc>(doc, (draft) => (draft.name = 'hello'));
        expect(doc.name).to.eql('hello');

        doc = Automerge.change<Doc>(doc, (draft) => {
          delete draft.name;
        });

        expect(doc.name).to.eql(undefined);
      });
    });

    e.describe('type manipulations (immutable)', (e) => {
      let doc = createDoc();
      const getAndChange = (fn: (json: any) => void) => {
        doc = Automerge.change<Doc>(doc, (draft) => {
          if (!draft.json) draft.json = {};
          fn(draft.json);
        });
        return doc;
      };

      e.it('string', () => {
        const doc = getAndChange((doc) => (doc.value = 'hello'));
        expect(doc.json?.value).to.eql('hello');
      });

      e.it('boolean', () => {
        let doc = getAndChange((doc) => (doc.value = true));
        expect(doc.json?.value).to.eql(true);

        doc = getAndChange((doc) => (doc.value = false));
        expect(doc.json?.value).to.eql(false);
      });

      e.it('number', () => {
        const doc = getAndChange((doc) => (doc.value = 1234));
        expect(doc.json?.value).to.eql(1234);
      });

      e.it('null', () => {
        const doc = getAndChange((doc) => (doc.value = null));
        expect(doc.json?.value).to.eql(null);
      });

      e.it('[ array ]', () => {
        const list = [1, 'two', true, {}, [123], null];
        const doc = getAndChange((doc) => (doc.value = list));

        expect(doc.json?.value).to.eql(list);

        // NB: immutable (not same instance of array)
        expect(doc.json?.value).to.not.equal(list);
        expect(doc.json?.value[3]).to.not.equal(list[3]); // object
        expect(doc.json?.value[4]).to.not.equal(list[4]); // array
      });

      e.describe('[ array ] methods', (e) => {
        e.it('.insertAt', () => {
          const doc = Automerge.change<Doc>(createDoc(), (draft) => {
            draft.cards.push({ title: 'item-1', done: false });
            draft.cards.insertAt?.(1, { title: 'item-2', done: false });
          });

          expect(doc.cards.length).to.eql(2);
          expect(doc.cards[0].title).to.eql('item-1');
          expect(doc.cards[1].title).to.eql('item-2');
        });

        e.it('.deleteAt', () => {
          const doc = Automerge.change<Doc>(createDoc(), (draft) => {
            draft.cards.insertAt?.(0, { title: 'item-1', done: false });
            draft.cards.insertAt?.(1, { title: 'item-2', done: false });
            draft.cards.deleteAt?.(0);
          });
          expect(doc.cards.length).to.eql(1);
          expect(doc.cards[0].title).to.eql('item-2');
          expect(doc.cards[1]).to.eql(undefined);
        });
      });

      e.it('{ object }', () => {
        const obj = { msg: 'hello', count: 123, list: [1, 2, 3], child: { enabled: true } };
        const doc = getAndChange((doc) => (doc.value = obj));

        expect(doc.json?.value).to.eql(obj);

        // NB: immutable (not same instance of array)
        expect(doc.json?.value).to.not.equal(obj);
        expect(doc.json?.value.list).to.not.equal(obj.list);
        expect(doc.json?.value.child).to.not.equal(obj.child);
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

      const { getActorId } = Automerge;
      expect(getActorId(doc1)).to.not.eql(getActorId(doc2));
    });
  });

  /**
   * https://github.com/automerge/automerge/blob/main/SYNC.md
   */
  e.describe('Network', (e) => {
    e.describe('Sync', (e) => {
      e.it('getChanges', () => {
        const A1 = createDoc();
        const B1 = Automerge.merge(Automerge.init<Doc>(), A1);

        let A2 = Automerge.change<Doc>(A1, (doc) => (doc.name = 'foo'));
        A2 = Automerge.change<Doc>(A2, (doc) => (doc.name = 'foobar'));

        const changes = Automerge.getChanges(A1, A2);
        expect(changes.length).to.eql(2);

        const [C1, patch] = Automerge.applyChanges(B1, changes);
        expect(C1.name).to.eql('foobar');
        expect(patch.diffs.objectId).to.eql('_root');
      });

      e.it('bus', () => {
        const bus = rx.bus();

        const A1 = createDoc();

        let B1: Doc;

        rx.payload<any>(bus.$, 'init').subscribe((e) => {
          // console.log('e', e);
          B1 = e.doc;
        });

        rx.payload<any>(bus.$, 'changes').subscribe((e) => {
          console.log('e', e);
          const res = Automerge.applyChanges(B1, e.changes);
          B1 = res[0];
          // B1 = e.doc;
        });

        bus.fire({ type: 'init', payload: { doc: A1 } });

        let A2 = Automerge.change<Doc>(A1, (doc) => (doc.name = 'foo'));
        const changes = Automerge.getChanges(A1, A2);

        bus.fire({ type: 'changes', payload: { changes } });

        console.log('B1.', B1?.name);
      });

      // e.it.skip('generateSyncMessage', () => {
      //   const { getActorId, getObjectId } = Automerge;

      //   type SyncState = {
      //     [peer: string]: {
      //       [docId: string]: Automerge.SyncState;
      //     };
      //   };

      //   const syncStates: SyncState = {}; // a hash of [source][docId] containing in-memory sync states
      //   const backends = {}; // a hash by [docId] of current backend values

      //   const docId = 'foo';

      //   let doc1 = getTestDoc();
      //   let doc2 = getTestDoc();
      //   doc1 = Automerge.change<Doc>(doc1, (doc) => (doc.name = 'foo'));

      //   // Automerge.Backend.decodeSyncState;

      //   function updatePeers(docId: string) {
      //     Object.entries(syncStates).forEach(([peer, syncState]) => {
      //       const [nextSyncState, syncMessage] = Automerge.Backend.generateSyncMessage(
      //         backends[docId],
      //         syncState[docId] || Automerge.Backend.initSyncState(),
      //       );
      //       syncStates[peer] = { ...syncStates[peer], [docId]: nextSyncState };
      //       if (syncMessage) {
      //         console.log('syncMessage', syncMessage);
      //         // sendMessage({
      //         //   docId, source: workerId, target: peer, syncMessage,
      //         // })
      //       }
      //     });
      //   }

      //   const s = Automerge.Backend.initSyncState();

      //   console.log('s', s);

      //   const r = Automerge.Backend.generateSyncMessage(doc1, s);
      //   // console.log('r', r);

      //   // console.log('getActorId | 2:', Automerge.getActorId(doc1));

      //   // console.log('-------------------------------------------');
      //   // console.log('getObjectId(doc1)', getObjectId(doc1));
      //   // // console.log('getObjectId(doc2)', getObjectId(doc2));
      //   // // console.log('getObjectId(doc2)', getObjectId(doc2.cards));

      //   // // console.log('-------------------------------------------');
      //   // // const f = Automerge.Backend.initSyncState();
      //   // // console.log('f', f);
      //   // const peer = '1234';
      //   // const docId = Automerge.getObjectId(doc1);

      //   // const res = Automerge.generateSyncMessage(doc1, Automerge.Backend.initSyncState());

      //   // console.log('-------------------------------------------');
      //   // console.log('res', res);
      //   // if (res[1] && res[0]) {
      //   //   const r = Automerge.receiveSyncMessage<Doc>(doc2, res[0], res[1]);
      //   //   // console.log('doc2', doc2);
      //   //   console.log('r', r);
      //   //   // console.log('r[0].name', r[0].name);
      //   //   // doc2 = Automerge.applyChanges(doc2, r[1]);
      //   //   if (r[1]) {
      //   //     doc2 = Automerge.Backend.applyLocalChange(doc2, res[1]);
      //   //   }

      //   //   console.log('doc2', doc2);
      //   // }

      //   // const d = Automerge.Backend.generateSyncMessage(
      //   //   backends[docId],
      //   //   syncStates[peer]?.[docId] || Automerge.Backend.initSyncState(),
      //   // );

      //   //
      // });
    });
  });
});
