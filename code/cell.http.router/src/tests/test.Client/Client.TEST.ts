import { Client, createMock, expect, t, TYPE_DEFS } from '../../test';

describe.only('Client', () => {
  describe('http', () => {
    it('from host (origin)', () => {
      const client = Client.http('localhost:1234');
      expect(client.origin).to.eql('http://localhost:1234');
    });
  });

  describe('TypeSystem', () => {
    it('from host (origin)', async () => {
      const client = Client.typesystem('localhost:1234');
      expect(client.http.origin).to.eql('http://localhost:1234');
    });

    it('client.defs', async () => {
      const { mock, client } = await testDefs();
      const defs = await client.defs('ns:foo');

      expect(defs.length).to.eql(1);
      expect(defs[0].uri).to.eql('ns:foo');
      expect(defs[0].typename).to.eql('MyRow');

      await mock.dispose();
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
