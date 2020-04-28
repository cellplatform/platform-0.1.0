import { Client, createMock, expect, t, TYPE_DEFS, fs } from '../../test';

describe('Client.TypeSystem', () => {
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
});

/**
 * [Helpers]
 */

async function testDefs() {
  const mock = await createMock();
  const client = Client.typesystem(mock.origin);
  await Promise.all(Object.keys(TYPE_DEFS).map((ns: any) => writeDefs(ns, client.http)));
  return { mock, client };
}

async function writeDefs(ns: string, http: t.IHttpClient) {
  const columns = TYPE_DEFS[ns].columns;
  await http.ns(ns).write({ columns });
}
