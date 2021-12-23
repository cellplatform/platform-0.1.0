import {
  t,
  expect,
  pkg,
  rx,
  Test,
  cuid,
  Is,
  Automerge,
  NetworkBusMockMesh,
  time,
} from '../web.test';
import { CrdtBus } from '.';

type Doc = { count: number; name?: string };

export default Test.describe('CrdtBus', (e) => {
  const bus = rx.bus();

  e.describe('is', (e) => {
    const is = CrdtBus.Events.is;

    e.it('is (static/instance)', () => {
      const events = CrdtBus.Events({ bus });
      expect(events.is).to.equal(is);
    });

    e.it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('sys.crdt/', true);
    });

    e.it('is.instance', () => {
      const type = 'sys.crdt/';
      expect(is.instance({ type, payload: { id: 'abc' } }, 'abc')).to.eql(true);
      expect(is.instance({ type, payload: { id: 'abc' } }, '123')).to.eql(false);
      expect(is.instance({ type: 'foo', payload: { id: 'abc' } }, 'abc')).to.eql(false);
    });
  });

  e.describe('controller', (e) => {
    e.it('id', async (e) => {
      const id = 'foo';
      const c1 = CrdtBus.Controller({ bus });
      const c2 = CrdtBus.Controller({ bus, id });
      expect(c1.id).to.eql('default-instance');
      expect(c2.id).to.eql(id);

      const fired = { e1: 0, e2: 0 };
      c1.events.$.subscribe((e) => fired.e1++);
      c2.events.$.subscribe((e) => fired.e2++);

      const info1 = await c1.events.info.get();
      expect(fired).to.eql({ e1: 2, e2: 0 }); // NB: 2 == req/res

      const info2 = await c2.events.info.get();
      expect(fired).to.eql({ e1: 2, e2: 2 }); // NB: 2 == req/res

      expect(info1.id).to.eql('default-instance');
      expect(info2.id).to.eql(id);

      c1.dispose();
      c2.dispose();
    });

    e.it('filter', async (e) => {
      let blockId = '';
      const c = CrdtBus.Controller({
        bus,
        id: 'foo',
        filter: (e) => (!blockId ? true : e.payload.id !== blockId),
      });

      const info1 = await c.events.info.get({ timeout: 5 });
      blockId = 'foo'; // NB: adjust dummy filter.
      const info2 = await c.events.info.get({ timeout: 5 });

      expect(info1.id).to.eql('foo');
      expect(info2.error).to.include('Timed out');

      c.dispose();
    });
  });

  e.describe('events.info', (e) => {
    e.it('exists', async () => {
      const { dispose, events } = CrdtBus.Controller({ bus });
      const res = await events.info.get();
      dispose();

      expect(res.id).to.eql('default-instance');

      expect(res.info?.module.name).to.eql(pkg.name);
      expect(res.info?.module.version).to.eql(pkg.version);

      expect(res.info?.dataformat.name).to.eql('automerge');
      expect(res.info?.dataformat.version).to.eql(pkg.dependencies?.automerge);
    });

    e.it('does not exist', async () => {
      const events = CrdtBus.Events({ bus });
      const res = await events.info.get({ timeout: 10 });
      expect(res.error).to.include('[info] Timed out');
    });
  });

  e.describe('events.ref (memory state)', (e) => {
    e.describe('initial', (e) => {
      e.it('via plain { object }', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 0 };

        const res1 = await events.ref.fire<Doc>({ id, initial });
        const res2 = await events.ref.fire<Doc>({ id, initial });
        dispose();

        expect(res1.doc.id).to.eql(id);
        expect(res1.doc.data).to.eql(initial);
        expect(Is.automergeObject(res1.doc.data)).to.eql(true);
        expect(res1.changed).to.eql(false);
        expect(res1.error).to.eql(undefined);

        expect(res1.created).to.eql(true);
        expect(res2.created).to.eql(false); // NB: second call retrieves existing state.
      });

      e.it('via { Automerge } object', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial = Automerge.from<Doc>({ count: 0 });

        const res = await events.ref.fire<Doc>({ id, initial });
        dispose();

        expect(res.doc.id).to.eql(id);
        expect(res.doc.data).to.eql(initial);
        expect(Is.automergeObject(res.doc.data)).to.eql(true);
      });

      e.it('via function', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 0 };

        const res = await events.ref.fire<Doc>({ id, initial: () => initial });
        dispose();

        expect(res.doc.id).to.eql(id);
        expect(res.doc.data).to.eql(initial);
        expect(Is.automergeObject(res.doc.data)).to.eql(true);
      });

      e.it('fires "created" event', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 0 };

        const fired: t.CrdtRefCreated[] = [];
        events.ref.created$.subscribe((e) => fired.push(e));

        await events.ref.fire<Doc>({ id, initial });
        await events.ref.fire<Doc>({ id, initial });
        await events.ref.fire<Doc>({ id, initial });
        dispose();

        expect(fired.length).to.eql(1);
        expect(fired[0].doc.id).to.eql(id);
      });
    });

    e.it('exists', async () => {
      const { dispose, events } = CrdtBus.Controller({ bus });
      const id = cuid();
      const initial: Doc = { count: 0 };

      const test = async (exists: boolean) => {
        const res = await events.ref.exists.fire(id);
        expect(res.exists).to.eql(exists);
        expect(res.error).to.eql(undefined);
        expect(res.doc).to.eql({ id });
      };

      await test(false);

      await events.ref.fire<Doc>({ id, initial });
      await test(true);

      await events.ref.remove.fire(id);
      await test(false);

      dispose();
    });

    e.describe('remove (memory ref)', (e) => {
      e.it('removes an existing reference', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 0 };

        const res1 = await events.ref.fire<Doc>({ id, initial });
        const res2 = await events.ref.fire<Doc>({ id, initial });

        expect(res1.created).to.eql(true);
        expect(res2.created).to.eql(false);
        expect((await events.ref.exists.fire(id)).exists).to.eql(true);

        events.ref.remove.fire(id);
        expect((await events.ref.exists.fire(id)).exists).to.eql(false);

        const res3 = await events.ref.fire<Doc>({ id, initial });
        expect(res3.created).to.eql(true); // NB: Initialized again as the reference was removed from memory.

        dispose();
      });

      e.it('fires "removed" event', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 0 };

        const fired: t.CrdtRefRemoved[] = [];
        events.ref.remove.removed$.subscribe((e) => fired.push(e));

        await events.ref.fire<Doc>({ id, initial });
        await events.ref.remove.fire(id);

        expect(fired.length).to.eql(1);
        expect(fired[0].doc.id).to.eql(id);

        dispose();
      });
    });

    e.describe('change', (e) => {
      e.it('change (function)', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 0 };

        const change = (doc: Doc) => {
          doc.count = 123;
          doc.name = 'hello';
        };

        const res = await events.ref.fire<Doc>({ id, initial, change });
        expect(res.changed).to.eql(true);
        expect(res.doc.data.count).to.eql(123);
        expect(res.doc.data.name).to.eql('hello');

        dispose();
      });

      e.it('change (replace { object })', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 0 };
        const getDoc = async () => (await events.ref.fire({ id, initial })).doc;

        const fired: t.CrdtRefChanged[] = [];
        events.ref.changed$.subscribe((e) => fired.push(e));

        const res1 = await events.ref.fire<Doc>({ id, initial, change: initial });
        expect(fired.length).to.eql(1);
        expect(fired[0].doc.next).to.eql(initial);

        // Edge-case, change passed in during initializer.
        expect(Is.automergeObject(res1.doc.data)).to.eql(true);
        expect(res1.doc.data).to.eql(initial);
        expect(await getDoc()).to.eql(res1.doc);

        // Make a change.
        const replacement = Automerge.change<Doc>(res1.doc.data, (d) => (d.count = 123));
        expect((await getDoc()).data).to.not.eql(replacement);

        // Submit the change as a replacement.
        const res2 = await events.ref.fire<Doc>({ id, initial, change: replacement });
        expect(res2.doc.data).to.eql(replacement);
        expect((await getDoc()).data).to.eql(replacement);
        expect(fired.length).to.eql(2);
        expect(fired[1].doc.next).to.eql(replacement);

        dispose();
      });

      e.it('"changed" event', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 0 };

        const changed: t.CrdtRefChanged[] = [];
        events.ref.changed$.subscribe((e) => changed.push(e));

        await events.ref.fire<Doc>({ id, initial, change: (doc) => (doc.name = 'foobar') });
        await events.ref.fire<Doc>({ id, initial, change: (doc) => doc.count++ });

        expect(changed.length).to.eql(2);

        expect(changed[0].doc.prev).to.eql(initial);
        expect(changed[0].doc.next).to.eql({ name: 'foobar', count: 0 });

        expect(changed[1].doc.prev).to.eql(changed[0].doc.next);
        expect(changed[1].doc.next).to.eql({ name: 'foobar', count: 1 });

        dispose();
      });
    });
  });

  e.describe('events.doc', (e) => {
    const TestSetup = {
      async base() {
        const controller = CrdtBus.Controller({ bus });
        const { dispose, events } = controller;
        return { controller, dispose, events };
      },
      async doc(options: { id?: string; initial?: Doc } = {}) {
        const base = await TestSetup.base();
        const initial: Doc = options.initial ?? { count: 0 };
        const { controller, dispose, events } = base;
        const id = options.id ?? cuid();
        const doc = await events.doc<Doc>({ id, initial });
        return { controller, dispose, events, id, initial, doc };
      },
    };

    e.it('from initial { object } and function', async () => {
      const { dispose, events } = await TestSetup.base();
      const initial: Doc = { count: 123 };
      const res1 = await events.doc<Doc>({ id: '1', initial });
      const res2 = await events.doc<Doc>({ id: '2', initial: () => initial });
      dispose();

      expect(res1.id).to.eql('1');
      expect(res1.current).to.eql(initial);

      expect(res2.id).to.eql('2');
      expect(res2.current).to.eql(initial);

      expect(res1.current).to.not.equal(res2.current); // NB: Not the same document instance.
    });

    e.it('same document instance', async () => {
      const { dispose, events } = await TestSetup.base();
      const initial: Doc = { count: 123 };
      const res1 = await events.doc<Doc>({ id: '1', initial });
      const res2 = await events.doc<Doc>({ id: '1', initial });
      const res3 = await events.doc<Doc>({ id: '2', initial });
      dispose();

      expect(res1.current).to.equal(res2.current);
      expect(res1.current).to.not.equal(res3.current); // NB: Not the same document instance.
    });

    e.it('from initial [Automerge] object', async () => {
      const { dispose, events } = await TestSetup.base();
      const res1 = await events.doc<Doc>({ id: '1', initial: { count: 0 } });
      const res2 = await events.doc<Doc>({ id: '2', initial: res1.current });
      dispose();

      expect(res1.current).to.eql(res2.current);
      expect(res1.current).to.not.equal(res2.current);
    });

    e.it('change', async () => {
      const { dispose, doc } = await TestSetup.doc();
      expect(doc.current.count).to.eql(0);

      const fired: t.CrdtRefChanged[] = [];
      doc.changed$.subscribe((e) => fired.push(e));
      const res = await doc.change((draft) => draft.count++);
      dispose();

      expect(res).to.eql({ count: 1 });

      expect(fired.length).to.eql(1);
      expect(fired[0].doc.id).to.eql(doc.id);
      expect(fired[0].doc.prev).to.eql({ count: 0 });
      expect(fired[0].doc.next).to.eql({ count: 1 });
    });

    e.it('change registered between different instances', async () => {
      const test1 = await TestSetup.doc();
      const test2 = await TestSetup.doc();

      const doc1 = test1.doc;
      const doc2 = test1.doc;

      expect(doc1.current).to.eql({ count: 0 });
      expect(doc2.current).to.eql({ count: 0 });

      await doc1.change((doc) => (doc.count = 123));

      expect(doc1.current).to.eql({ count: 123 });
      expect(doc2.current).to.eql({ count: 123 });

      test1.dispose();
      test2.dispose();
    });
  });

  e.describe.only('sync (v1)', (e) => {
    const testNetwork = async (total: number) => {
      const mocks = NetworkBusMockMesh<t.CrdtEvent>(total, { memorylog: true });
      const peers = await Promise.all(
        mocks.map((netbus) => {
          const id = netbus.mock.local;
          const bus = rx.bus();
          const debounce = 10;
          const ctrl = CrdtBus.Controller({ id, bus, sync: { version: '1', netbus, debounce } });
          const { events, dispose } = ctrl;
          const doc = (id: string, initial?: Doc) => {
            return events.doc<Doc>({ id, initial: initial ?? { count: 0 } });
          };
          return { id, netbus, ctrl, events, doc, dispose };
        }),
      );
      const dispose = () => peers.forEach((peer) => peer.dispose());
      return { peers, dispose };
    };

    e.it('tmp', async () => {
      const network = await testNetwork(2);

      const [peer1, peer2] = network.peers;

      const id = 'foo';
      const doc1 = await peer1.doc(id);
      console.log('doc', doc1);

      // console.log('-------------------------------------------');
      // console.log('p1/info', await peer1.events.info.get());
      // console.log('p2/info', await peer2.events.info.get());

      await time.wait(50);

      doc1.change((d) => (d.count = 123));

      let doc2 = await peer2.doc(id);

      console.log('doc2', doc2.current);

      await time.wait(500);

      doc2 = await peer2.doc(id);
      console.log('doc2', doc2.current);
      // network.dispose();
    });

    // e.it.only('temp-2', async () => {
    //   const doc1 = Automerge.from<Doc>({ count: 0 });
    //   let doc2 = Automerge.from<Doc>(Automerge.clone(doc1));

    //   // const doc3 = Automerge.change<Doc>(doc2, (d) => (d.count = 123));

    //   // Automerge.

    //   const changes = Automerge.getChanges(doc1, doc2);
    //   // const changes = Automerge.getChanges(doc1, doc1);
    //   console.log('changes', changes);
    // });

    // e.it.skip('tmpe-3', async () => {
    //   const doc1 = Automerge.from<Doc>({ count: 0 });
    //   const doc2 = Automerge.change<Doc>(doc1, 'count', (doc) => {
    //     // doc.cards.push({ title: 'hello', done: false });
    //     doc.count = 123;
    //   });

    //   const changes = Automerge.getChanges<Doc>(doc1, doc2);
    //   console.log('changes', changes);
    // });
  });
});
