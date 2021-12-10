import { t, expect, pkg, rx, Test, cuid, Is, Automerge } from '../web.test';
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

  e.describe('Controller/Events', (e) => {
    e.describe('info', (e) => {
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

    e.describe('state (ref)', (e) => {
      e.it('initial via plain { object }', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const doc = cuid();
        const initial: Doc = { count: 0 };

        const res1 = await events.state.fire<Doc>({ doc, initial });
        const res2 = await events.state.fire<Doc>({ doc, initial });
        dispose();

        expect(res1.doc.id).to.eql(doc);
        expect(res1.doc.data).to.eql(initial);
        expect(Is.automergeObject(res1.doc.data)).to.eql(true);
        expect(res1.changed).to.eql(false);
        expect(res1.error).to.eql(undefined);

        expect(res1.created).to.eql(true);
        expect(res2.created).to.eql(false); // NB: second call retrieves existing state.
      });

      e.it('initial via { Automerge } object', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const doc = cuid();
        const initial = Automerge.from<Doc>({ count: 0 });

        const res = await events.state.fire<Doc>({ doc, initial });
        dispose();

        expect(res.doc.id).to.eql(doc);
        expect(res.doc.data).to.eql(initial);
        expect(Is.automergeObject(res.doc.data)).to.eql(true);
      });

      e.it('initial via function', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const doc = cuid();
        const initial: Doc = { count: 0 };

        const res = await events.state.fire<Doc>({ doc, initial: () => initial });
        dispose();

        expect(res.doc.id).to.eql(doc);
        expect(res.doc.data).to.eql(initial);
        expect(Is.automergeObject(res.doc.data)).to.eql(true);
      });

      e.it('exists', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const doc = cuid();
        const initial: Doc = { count: 0 };

        const test = async (exists: boolean) => {
          const res = await events.state.exists.fire(doc);
          expect(res.exists).to.eql(exists);
          expect(res.error).to.eql(undefined);
          expect(res.doc).to.eql(doc);
        };

        await test(false);

        await events.state.fire<Doc>({ doc, initial });
        await test(true);

        await events.state.remove.fire(doc);
        await test(false);

        dispose();
      });

      e.it('remove (memory ref)', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const doc = cuid();
        const initial: Doc = { count: 0 };

        const res1 = await events.state.fire<Doc>({ doc, initial });
        const res2 = await events.state.fire<Doc>({ doc, initial });

        expect(res1.created).to.eql(true);
        expect(res2.created).to.eql(false);

        events.state.remove.fire(doc);
        const res3 = await events.state.fire<Doc>({ doc, initial });
        expect(res3.created).to.eql(true); // NB: Initialized again as the reference was removed from memory.

        dispose();
      });

      e.it('change', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const doc = cuid();
        const initial: Doc = { count: 0 };

        const change = (doc: Doc) => {
          doc.count = 123;
          doc.name = 'hello';
        };

        const res = await events.state.fire<Doc>({ doc, initial, change });
        expect(res.changed).to.eql(true);
        expect(res.doc.data.count).to.eql(123);
        expect(res.doc.data.name).to.eql('hello');

        dispose();
      });

      e.it('changed (events)', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const doc = cuid();
        const initial: Doc = { count: 0 };

        const changed: t.CrdtRefChanged[] = [];
        events.state.changed$.subscribe((e) => changed.push(e));

        await events.state.fire<Doc>({ doc, initial, change: (doc) => (doc.name = 'foobar') });
        await events.state.fire<Doc>({ doc, initial, change: (doc) => doc.count++ });

        expect(changed.length).to.eql(2);

        expect(changed[0].doc.prev).to.eql(initial);
        expect(changed[0].doc.next).to.eql({ name: 'foobar', count: 0 });

        expect(changed[1].doc.prev).to.eql(changed[0].doc.next);
        expect(changed[1].doc.next).to.eql({ name: 'foobar', count: 1 });

        dispose();
      });
    });

    e.describe('doc', (e) => {
      e.it.skip('TODO: initial: { object }', async () => {
        const { dispose, events } = CrdtBus.Controller({ bus });
        const id = cuid();
        const initial: Doc = { count: 123 };
        const res = events.doc<Doc>({ id, initial });
        dispose();

        expect(res.id).to.eql(id);
      });
    });
  });
});
