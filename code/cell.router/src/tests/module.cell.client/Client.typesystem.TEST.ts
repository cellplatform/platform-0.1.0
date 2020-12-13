import { Subject } from 'rxjs';
import { delay, filter, take } from 'rxjs/operators';

import { Client, createMock, ERROR, expect, fs, t, time, TYPE_DEFS } from '../../test';
import * as g from '../.d.ts/all';

describe('Client.TypeSystem', function () {
  this.timeout(999999);

  it('from host (origin)', async () => {
    const client = Client.typesystem('localhost:1234');
    expect(client.http.origin).to.eql('http://localhost:1234');
  });

  describe('client.typeDefs', () => {
    it('single namespace', async () => {
      const { mock, client } = await testDefs();
      const defs = await client.typeDefs('ns:foo');
      await mock.dispose();

      expect(defs.length).to.eql(1);
      expect(defs[0].uri).to.eql('ns:foo');
      expect(defs[0].typename).to.eql('MyRow');
    });

    it('multiple namespaces', async () => {
      const { mock, client } = await testDefs();
      const defs = await client.typeDefs(['ns:foo', 'ns:foo.color']);
      await mock.dispose();

      expect(defs.length).to.eql(2);

      expect(defs[0].uri).to.eql('ns:foo');
      expect(defs[0].typename).to.eql('MyRow');

      expect(defs[1].uri).to.eql('ns:foo.color');
      expect(defs[1].typename).to.eql('MyColor');
    });
  });

  describe('client.implements', () => {
    it('from host (origin)', async () => {
      const { mock, client } = await testDefs();
      const res = await client.implements('foo.mySheet');
      await mock.dispose();

      expect(res.error).to.eql(undefined);
      expect(res.ns).to.eql('ns:foo.mySheet');
      expect(res.implements).to.eql('ns:foo');
      expect(res.typeDefs.length).to.eql(1);
      expect(res.typeDefs[0].typename).to.eql('MyRow');
    });

    it('converts from input URI to namespace', async () => {
      const { mock, client } = await testDefs();

      const test = async (uri: string) => {
        const res = await client.implements(uri);
        expect(res.error).to.eql(undefined);
        expect(res.ns).to.eql('ns:foo.mySheet');
      };

      await test('foo.mySheet');
      await test('cell:foo.mySheet:A1');
      await test('cell:foo.mySheet:A');
      await test('cell:foo.mySheet:1');

      await mock.dispose();
    });

    it('no {type.implements}', async () => {
      const { mock, client } = await testDefs();
      const res = await client.implements('ns:foo');
      await mock.dispose();

      expect(res.error).to.eql(undefined);
      expect(res.ns).to.eql('ns:foo');
      expect(res.implements).to.eql('');
      expect(res.typeDefs).to.eql([]);
    });

    it('error: sheet does not exist', async () => {
      const { mock, client } = await testDefs();
      const res = await client.implements('ns:foo.404');
      await mock.dispose();

      expect(res.ns).to.eql('ns:foo.404');
      expect(res.implements).to.eql('');
      expect(res.typeDefs).to.eql([]);

      expect(res.error?.status).to.eql(404);
      expect(res.error?.type).to.eql('HTTP/type');
      expect(res.error?.message).to.include('Failed to retrieve implementing type');
    });
  });

  describe('typescript', () => {
    const dir = fs.resolve('src/tests/.d.ts');

    it('save: single namespace', async () => {
      const { mock, client } = await testDefs();
      const ts = await client.typescript('ns:foo.color');
      await mock.dispose();

      const path = fs.join(dir, 'MyColor.ts');
      await ts.save(fs, path);

      const file = (await fs.readFile(path)).toString();
      expect(file).to.include(`export declare type MyColor = {`);
    });

    it('save: multiple namespaces (all)', async () => {
      const { mock, client } = await testDefs();
      const ts = await client.typescript(Object.keys(TYPE_DEFS));
      await mock.dispose();

      const path = fs.join(dir, 'all.ts');
      await ts.save(fs, path);

      const file = (await fs.readFile(path)).toString();
      expect(file).to.include(`export declare type MyRow = {`);
      expect(file).to.include(`export declare type MyColor = {`);
      expect(file).to.include(`export declare type MyMessage = {`);
      expect(file).to.include(`export declare type MyMessages = {`);
    });
  });

  describe('sheet', () => {
    it('loads sheet', async () => {
      const { mock, client } = await testDefs();
      const sheet = await client.sheet<g.TypeIndex>('ns:foo.mySheet');
      const row = sheet.data('MyRow').row(0).props;
      await mock.dispose();
      expect(row.title).to.eql('Untitled');
    });

    describe('change monitor', () => {
      it('singleton instance', async () => {
        const { mock, client } = await testDefs();
        await mock.dispose();
        expect(client.changes).to.equal(client.changes);
      });

      it('watches for changes', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet<g.TypeIndex>('ns:foo.mySheet');
        client.changes.watch(sheet);

        const fired: t.ITypedSheetChanged[] = [];
        client.changes.changed$.subscribe((e) => fired.push(e));

        const row = await sheet.data('MyRow').row(0).load();
        row.props.title = '1';
        row.props.title = '2';
        row.props.title = '3';

        await time.wait(20);

        sheet.dispose(); // NB: Auto un-watches so "goodbye" is not the final change.
        row.props.title = 'goodbye';

        await time.wait(50);
        await mock.dispose();

        expect(fired.length).to.eql(3);
        expect(fired[2].sheet).to.equal(sheet);
        expect(fired[2].change.to).to.eql({ value: '3' });
      });
    });

    describe('save monitor', () => {
      it('saves cell changes', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet<g.TypeIndex>('ns:foo.mySheet');
        const saver = Client.saveMonitor({ client, debounce: 10 });
        client.changes.watch(sheet);

        expect(sheet.state.changes).to.eql({ uri: 'ns:foo.mySheet' });
        expect(saver.debounce).to.eql(10);

        const cursor = await sheet.data('MyRow').load();
        const row = cursor.row(0).props;
        row.title = '1';
        row.title = '2';
        row.title = '3';
        row.isEnabled = true;

        await time.delay(50);
        const res = await client.http.ns('ns:foo.mySheet').read({ cells: true });
        await mock.dispose();

        const cells = res.body.data.cells as t.ICellMap<any>;

        expect(sheet.state.changes).to.eql({ uri: 'ns:foo.mySheet' }); // NB: Pending state changes have been reset after save.
        expect(cells?.A1?.value).to.eql('3');
        expect(cells?.B1?.props?.isEnabled).to.eql(true);
      });

      it('saves namespace change', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet<g.TypeIndex>('ns:foo.mySheet');
        client.changes.watch(sheet);

        const ns1 = (await client.http.ns('ns:foo.mySheet').read()).body.data.ns;
        expect(ns1.props?.type?.implements).to.eql('ns:foo');

        const saver = Client.saveMonitor({ client, debounce: 5 });
        expect(saver.debounce).to.eql(5);

        sheet.state.change.ns({ type: { implements: 'ns:boom' } });
        await time.delay(50);

        const ns2 = (await client.http.ns('ns:foo.mySheet').read()).body.data.ns;
        await mock.dispose();

        expect(sheet.state.changes).to.eql({ uri: 'ns:foo.mySheet' }); // NB: Pending state changes have been reset after save.
        expect(ns2.props?.type?.implements).to.eql('ns:boom');
        expect(ns2.props?.schema).to.eql(ns1.props?.schema);
      });

      it('default debounce', async () => {
        const { mock, client } = await testDefs();
        const saver = Client.saveMonitor({ client });
        expect(saver.debounce).to.eql(300);
        await mock.dispose();
      });

      it('secondary changes while save operation in progress', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet<g.TypeIndex>('ns:foo.mySheet');
        const saver = Client.saveMonitor({ client, debounce: 5 });
        client.changes.watch(sheet);

        saver.saving$.pipe(take(1), delay(10)).subscribe((e) => {
          row.title = 'second'; // Trigger another save by changing the row again when the save starts.
        });

        const responses$ = new Subject();
        const responses: t.IHttpClientResponse<any>[] = [];
        saver.saved$.subscribe(async (e) => {
          const res = await client.http.ns('ns:foo.mySheet').read({ cells: true });
          responses.push(res);
          responses$.next();
        });

        const fired: t.TypedSheetEvent[] = [];
        saver.event$.subscribe((e) => fired.push(e));

        const cursor = await sheet.data('MyRow').load();
        const row = cursor.row(0).props;
        row.title = 'first';

        await time.wait(responses$.pipe(filter(() => responses.length === 2)));
        await mock.dispose();

        const cells1 = responses[0]?.body.data.cells || {};
        const cells2 = responses[1]?.body.data.cells || {};

        expect(cells1.A1?.value).to.eql('first');
        expect(cells2.A1?.value).to.eql('second');
      });

      it('bubbles events: saving/saved', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet<g.TypeIndex>('ns:foo.mySheet');
        const saver = Client.saveMonitor({ client, debounce: 10 });
        client.changes.watch(sheet);

        const fired: t.TypedSheetEvent[] = [];
        saver.event$.subscribe((e) => fired.push(e));

        const cursor = await sheet.data('MyRow').load();
        const row = cursor.row(0).props;

        row.title = 'hello';
        row.isEnabled = true;

        sheet.state.change.ns({ type: { implements: 'ns:foobar' } });
        await time.delay(80);
        await mock.dispose();

        expect(fired.length).to.eql(3);
        expect(fired[0].type).to.eql('TypedSheet/saving');
        expect(fired[1].type).to.eql('TypedSheet/saved');
        expect(fired[2].type).to.eql('TypedSheet/sync');

        const saving = fired[0].payload as t.ITypedSheetSaving;
        const saved = fired[1].payload as t.ITypedSheetSaved;

        expect(saved.ok).to.eql(true);
        expect(saved.error).to.eql(undefined);

        const target = client.http.origin;
        expect(saving.target).to.eql(target);
        expect(saved.target).to.eql(target);

        expect(saving.changes).to.eql(saved.changes);
        const changes = saved.changes;

        expect(changes.ns?.from.type?.implements).to.eql('ns:foo');
        expect(changes.ns?.to.type?.implements).to.eql('ns:foobar');

        expect(changes.cells?.A1.from).to.eql({});
        expect(changes.cells?.A1.to).to.eql({ value: 'hello' });

        expect(changes.cells?.B1.from).to.eql({});
        expect(changes.cells?.B1.to).to.eql({ props: { isEnabled: true } });
      });

      it('bubbles event: error', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet<g.TypeIndex>('ns:foo.mySheet');
        const saver = Client.saveMonitor({ client, debounce: 10 });
        client.changes.watch(sheet);

        const errorType = ERROR.HTTP.HASH_MISMATCH;
        mock.service.response$.pipe(filter((e) => e.method === 'POST')).subscribe((e) => {
          const status = 422;
          const error: t.IHttpError = { status, message: 'My fail', type: errorType };
          e.modify({ status, data: error }); // NB: Simulate a server-side error.
        });

        const fired: t.TypedSheetEvent[] = [];
        saver.event$.subscribe((e) => fired.push(e));

        const cursor = await sheet.data('MyRow').load();
        const row = cursor.row(0).props;
        row.title = 'hello';
        row.isEnabled = true;

        await time.delay(50);
        await mock.dispose();

        expect(fired[1].type).to.eql('TypedSheet/saved');

        const e = fired[1].payload as t.ITypedSheetSaved;
        const error = e.error;
        expect(error?.status).to.eql(422);
        expect(error?.type).to.eql(ERROR.HTTP.SERVER);
        expect(error?.message).to.include(`Failed while saving data to`);
        expect(error?.message).to.include(client.http.origin);

        const child = (error?.children || [])[0] as t.IHttpError;
        expect(child.status).to.eql(422);
        expect(child.type).to.eql(errorType);
        expect(child.message).to.include('My fail');
      });

      it('stores "implements" (on REF model creation)', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet<g.TypeIndex>('ns:foo.mySheet');
        Client.saveMonitor({ client, debounce: 5 });
        client.changes.watch(sheet);

        const cursor = await sheet.data('MyRow').load();
        const row = cursor.row(0);
        const messages = await row.props.messages.load();

        await time.delay(50);

        const res = await client.http.ns(messages.ns).read();
        const ns = res.body.data.ns;
        await mock.dispose();

        // NB: This value was written to the model via the [ChangeMonitor]
        //     then persisted to the DB via the [SaveMonitor].
        expect(ns.props?.type?.implements).to.eql('ns:foo.message');
      });
    });
  });
});

/**
 * [Helpers]
 */

async function testDefs() {
  const mock = await createMock();
  const client = Client.typesystem(mock.origin);

  // Write definitions.
  await Promise.all(Object.keys(TYPE_DEFS).map((ns: any) => writeDefs(ns, client.http)));

  // Write sample sheets.
  await client.http.ns('ns:foo.mySheet').write({ ns: { type: { implements: 'ns:foo' } } });

  // Finish up.
  return { mock, client };
}

async function writeDefs(ns: string, http: t.IHttpClient) {
  const columns = TYPE_DEFS[ns].columns;
  await http.ns(ns).write({ columns });
}
