import { Observable, Subject } from 'rxjs';
import { delay, filter, take } from 'rxjs/operators';

import { Client, createMock, ERROR, expect, fs, t, time, TYPE_DEFS } from '../../test';
import * as g from '../.d.ts/all';

describe.only('Client.TypeSystem', () => {
  it('from host (origin)', async () => {
    const client = Client.typesystem('localhost:1234');
    expect(client.http.origin).to.eql('http://localhost:1234');
  });

  describe('client.defs', () => {
    it('single namespace', async () => {
      const { mock, client } = await testDefs();
      const defs = await client.defs('ns:foo');
      await mock.dispose();

      expect(defs.length).to.eql(1);
      expect(defs[0].uri).to.eql('ns:foo');
      expect(defs[0].typename).to.eql('MyRow');
    });

    it('multiple namespaces', async () => {
      const { mock, client } = await testDefs();
      const defs = await client.defs(['ns:foo', 'ns:foo.color']);
      await mock.dispose();

      expect(defs.length).to.eql(2);

      expect(defs[0].uri).to.eql('ns:foo');
      expect(defs[0].typename).to.eql('MyRow');

      expect(defs[1].uri).to.eql('ns:foo.color');
      expect(defs[1].typename).to.eql('MyColor');
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
      const sheet = await client.sheet('ns:foo.mySheet');
      const row = sheet.data<g.MyRow>('MyRow').row(0).props;
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
        const sheet = await client.sheet('ns:foo.mySheet');
        client.changes.watch(sheet);

        const fired: t.ITypedSheetChanged[] = [];
        client.changes.changed$.subscribe(e => fired.push(e));

        const row = await sheet
          .data<g.MyRow>('MyRow')
          .row(0)
          .load();

        row.props.title = '1';
        row.props.title = '2';
        row.props.title = '3';

        await time.wait(5);

        sheet.dispose(); // NB: Auto un-watches so "goodbye" is not the final change.
        row.props.title = 'goodbye';

        await time.wait(5);
        await mock.dispose();

        expect(fired.length).to.eql(3);
        expect(fired[2].sheet).to.equal(sheet);
        expect(fired[2].change.to).to.eql({ value: '3' });
      });
    });

    describe('save monitor', () => {
      it('saves cell changes', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet('ns:foo.mySheet');
        expect(sheet.state.changes).to.eql({});

        client.changes.watch(sheet);

        const saver = Client.saveMonitor({ client, debounce: 1 });
        expect(saver.debounce).to.eql(1);

        const cursor = await sheet.data<g.MyRow>('MyRow').load();
        const row = cursor.row(0).props;
        row.title = '1';
        row.title = '2';
        row.title = '3';
        row.isEnabled = true;

        await time.delay(50);
        const res = await client.http.ns('ns:foo.mySheet').read({ cells: true });
        await mock.dispose();

        const cells = res.body.data.cells as t.ICellMap<any>;

        expect(sheet.state.changes).to.eql({}); // NB: Pending state changes have been reset after save.
        expect(cells?.A1?.value).to.eql('3');
        expect(cells?.B1?.props?.isEnabled).to.eql(true);
      });

      it('saves namespace change', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet('ns:foo.mySheet');
        client.changes.watch(sheet);

        const ns1 = (await client.http.ns('ns:foo.mySheet').read()).body.data.ns;
        expect(ns1.props?.type?.implements).to.eql('ns:foo');

        const saver = Client.saveMonitor({ client, debounce: 5 });
        expect(saver.debounce).to.eql(5);

        sheet.state.fireNsChanged({ to: { type: { implements: 'ns:boom' } } });
        await time.delay(50);

        const ns2 = (await client.http.ns('ns:foo.mySheet').read()).body.data.ns;
        await mock.dispose();

        expect(sheet.state.changes).to.eql({}); // NB: Pending state changes have been reset after save.
        expect(ns2.props?.type?.implements).to.eql('ns:boom');
        expect(ns2.props?.schema).to.eql(ns1.props?.schema);
      });

      it('default debounce', async () => {
        const { mock, client } = await testDefs();
        const saver = Client.saveMonitor({ client });
        expect(saver.debounce).to.eql(300);
        await mock.dispose();
      });

      it.skip('stores "implements"', async () => {});

      it('secondary changes while save operation in progress', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet('ns:foo.mySheet');
        const saver = Client.saveMonitor({ client, debounce: 5 });
        client.changes.watch(sheet);

        saver.saving$.pipe(take(1), delay(10)).subscribe(e => {
          row.title = 'second'; // Trigger another save by changing the row again when the save starts.
        });

        const responses$ = new Subject();
        const responses: t.IHttpClientResponse<any>[] = [];
        saver.saved$.subscribe(async e => {
          const res = await client.http.ns('ns:foo.mySheet').read({ cells: true });
          responses.push(res);
          responses$.next();
        });

        const fired: t.ITypedSheetSaveEvent[] = [];
        saver.event$.subscribe(e => fired.push(e));

        const cursor = await sheet.data<g.MyRow>('MyRow').load();
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
        const sheet = await client.sheet('ns:foo.mySheet');
        const saver = Client.saveMonitor({ client, debounce: 10 });
        client.changes.watch(sheet);

        const fired: t.ITypedSheetSaveEvent[] = [];
        saver.event$.subscribe(e => fired.push(e));

        const cursor = await sheet.data<g.MyRow>('MyRow').load();
        const row = cursor.row(0).props;

        row.title = 'hello';
        row.isEnabled = true;

        sheet.state.fireNsChanged({ to: { type: { implements: 'ns:foobar' } } });

        await time.delay(50);
        await mock.dispose();

        expect(fired.length).to.eql(2);
        expect(fired[0].type).to.eql('SHEET/saving');
        expect(fired[1].type).to.eql('SHEET/saved');

        const saving = fired[0].payload as t.ITypedSheetSaving;
        const saved = fired[1].payload as t.ITypedSheetSaved;

        expect(saved.ok).to.eql(true);
        expect(saved.errors).to.eql([]);

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

      it('bubbles event: errors', async () => {
        const { mock, client } = await testDefs();
        const sheet = await client.sheet('ns:foo.mySheet');
        const saver = Client.saveMonitor({ client, debounce: 10 });
        client.changes.watch(sheet);

        const errorType = ERROR.HTTP.HASH_MISMATCH;
        mock.service.response$.pipe(filter(e => e.method === 'POST')).subscribe(e => {
          const status = 422;
          const error: t.IHttpError = { status, message: 'My fail', type: errorType };
          e.modify({ status, data: error }); // NB: Simulate a server-side error.
        });

        const fired: t.ITypedSheetSaveEvent[] = [];
        saver.event$.subscribe(e => fired.push(e));

        const cursor = await sheet.data<g.MyRow>('MyRow').load();
        const row = cursor.row(0).props;
        row.title = 'hello';
        row.isEnabled = true;

        await time.delay(50);
        await mock.dispose();

        expect(fired[1].type).to.eql('SHEET/saved');

        const e = fired[1].payload as t.ITypedSheetSaved;

        expect(e.errors.length).to.eql(1);
        expect(e.errors[0].ns).to.eql('ns:foo.mySheet');

        const error = e.errors[0].error;
        expect(error.status).to.eql(422);
        expect(error.type).to.eql(ERROR.HTTP.SERVER);
        expect(error.message).to.include(`Failed while saving data to`);
        expect(error.message).to.include(client.http.origin);

        const child = (error.children || [])[0] as t.IHttpError;
        expect(child.status).to.eql(422);
        expect(child.type).to.eql(errorType);
        expect(child.message).to.include('My fail');
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
