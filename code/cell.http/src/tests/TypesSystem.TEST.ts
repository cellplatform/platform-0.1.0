import { createMock, expect, http, t } from '../test';
import { TypeSystem } from '../TypeSystem';
import * as g from './.d.ts/MyRow';

type SampleTypeDefs = { 'ns:foo': t.ITypeDefPayload; 'ns:foo.color': t.ITypeDefPayload };

const TYPE_DEFS: SampleTypeDefs = {
  'ns:foo': {
    ns: {
      type: { typename: 'MyRow' },
    },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string' } } },
      B: { props: { prop: { name: 'isEnabled', type: 'boolean', target: 'inline:isEnabled' } } },
      C: {
        props: { prop: { name: 'color', type: '=ns:foo.color', target: 'inline:color' } },
      },
    },
  },

  'ns:foo.color': {
    ns: {
      type: { typename: 'MyColor' },
    },
    columns: {
      A: { props: { prop: { name: 'label', type: 'string' } } },
      B: { props: { prop: { name: 'color', type: '"red" | "green" | "blue"' } } },
    },
  },
};

const writeTypes = async (args: { client: t.IHttpClient }) => {
  const { client } = args;
  await client.ns('foo').write(TYPE_DEFS['ns:foo']);
  await client.ns('foo.color').write(TYPE_DEFS['ns:foo.color']);

  return { client };
};

describe('TypeSystem (on http server)', () => {
  it.skip('persist changes back to server', () => {}); // tslint:disable-line

  describe('TypeClient', () => {
    it('read from [http server]', async () => {
      const mock = await createMock();
      const client = mock.client;

      await writeTypes({ client });

      // const res2 = await mock.client.ns('foo').read({ data: true });

      // console.log('-------------------------------------------');
      const url = mock.url('ns:foo/types');
      const res3 = await http.get(url);
      const json = res3.json as t.IResGetNsTypes;

      // console.log('json.types', json.types);
      // console.log('-------------------------------------------');
      // console.log('json.types[2]', json.types[2].type);

      // console.log('-------------------------------------------');
      // console.log('status', res3.status);
      // console.log(res3.json?.types);
      // console.log('Schema.uri.allow', Schema.uri.ALLOW);

      // console.log('-------------------------------------------');
      // console.log('');
      // console.log(json.typescript);
      // console.log('-------------------------------------------');

      await mock.dispose();
    });
  });

  describe('TypedSheet', () => {
    it('read from [http server]', async () => {
      const mock = await createMock();
      const client = mock.client;
      await writeTypes({ client });

      const def = await TypeSystem.Type.client(client).load('ns:foo');
      const cells = TypeSystem.objectToCells<g.MyRow>(def).rows(0, [
        { title: 'One', isEnabled: true, color: { label: 'background', color: 'red' } },
        { title: 'Two', isEnabled: false, color: { label: 'foreground', color: 'blue' } },
      ]);

      await client.ns('foo.mySheet').write({
        ns: { type: { implements: 'ns:foo' } },
        cells,
      });

      const ns = 'ns:foo.mySheet';
      const sheet = await TypeSystem.Sheet.client(client).load<g.MyRow>(ns);

      const cursor = await sheet.cursor({ index: -5 }); // NB: min-index is 0.

      expect(cursor.uri).to.eql(ns);
      expect(cursor.index).to.eql(0);

      await mock.dispose();

      const row1 = cursor.row(0);
      const row2 = cursor.row(1);

      expect(row1).to.not.eql(undefined);
      expect(row2).to.not.eql(undefined);

      if (row1) {
        expect(row1.title).to.eql('One');
        expect(row1.isEnabled).to.eql(true);
        expect(row1.color).to.eql({ label: 'background', color: 'red' });
      }

      if (row2) {
        expect(row2.title).to.eql('Two');
        expect(row2.isEnabled).to.eql(false);
        expect(row2.color).to.eql({ label: 'foreground', color: 'blue' });
      }
    });
  });
});
