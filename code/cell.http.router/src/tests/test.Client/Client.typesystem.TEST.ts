import { Client, createMock, expect, t, TYPE_DEFS, fs, time } from '../../test';
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
